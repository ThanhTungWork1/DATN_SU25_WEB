<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BannerController extends Controller
{
    public function index()
    {
        // Public: chỉ lấy banner đang bật, giảm cache xuống 5 giây để cập nhật nhanh hơn
        $banners = Cache::remember('banners_active', 5, function () {
            return Banner::where('status', true)->orderBy('id')->get();
        });
        $banners->transform(function ($b) {
            if ($b->image_url) {
                // Nếu là đường dẫn tương đối, chuyển thành URL tuyệt đối an toàn
                if (!str_starts_with($b->image_url, 'http')) {
                    $b->image_url = url($b->image_url); // tự thêm host + xử lý thiếu '/'
                }
            }
            return $b;
        });
        return response()->json(['data' => $banners]);
    }

    /**
     * Admin: Lấy toàn bộ banner (không cache) để đảm bảo thấy ngay dữ liệu mới
     */
    public function adminIndex()
    {
        $banners = Banner::orderBy('id')->get();
        $banners->transform(function ($b) {
            Log::info('Admin banner data', ['id' => $b->id, 'original_image_url' => $b->image_url, 'public_id' => $b->public_id]);
            
            if ($b->image_url) {
                if (!str_starts_with($b->image_url, 'http')) {
                    $b->image_url = url($b->image_url);
                }
            }
            
            Log::info('Admin banner transformed', ['id' => $b->id, 'final_image_url' => $b->image_url]);
            return $b;
        });
        return response()->json(['data' => $banners]);
    }

    /**
     * Admin: Tạo mới banner (upload ảnh).
     * - Lưu file vào disk public (folder banners/)
     * - Lưu DB với image_url (Storage::url), public_id (đường dẫn file), status (mặc định true)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:8192',
            'status' => 'nullable|boolean',
        ]);

        // Upload ảnh
        $path = $request->file('image')->store('banners', 'public');
        $url = Storage::disk('public')->url($path);
        // Tránh double host: nếu Storage::url trả về URL tuyệt đối thì dùng luôn, nếu tương đối thì thêm host
        $fullUrl = str_starts_with($url, 'http') ? $url : url($url);

        // Tạo banner
        $banner = Banner::create([
            'image_url' => $fullUrl,
            'public_id' => $path,
            'status' => (bool)($validated['status'] ?? true),
        ]);

        // Xóa cache
        Cache::forget('banners_active');

        Log::info('Banner created', ['id' => $banner->id, 'public_id' => $path, 'image_url' => $fullUrl]);

        return response()->json([
            'message' => 'Tạo banner thành công',
            'data' => $banner,
        ], 201);
    }

    /**
     * Admin: Cập nhật banner (thay ảnh và/hoặc trạng thái)
     */
    public function update(Request $request, $id)
    {
        // Log request data for debugging
        Log::info('Banner update request:', [
            'id' => $id,
            'method' => $request->method(),
            'has_image' => $request->hasFile('image'),
            'status' => $request->get('status'),
            '_method' => $request->get('_method'),
            'all_data' => $request->except(['image'])
        ]);

        $banner = Banner::findOrFail($id);

        // Log request data for debugging
        Log::info('Banner update request', [
            'id' => $id,
            'method' => $request->method(),
            'has_file' => $request->hasFile('image'),
            'status' => $request->get('status'),
            '_method' => $request->get('_method'),
            'content_type' => $request->header('Content-Type')
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            Log::info('File details', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
                'size' => $file->getSize(),
                'is_valid' => $file->isValid(),
                'path' => $file->getPathname()
            ]);
        }

        // Validate without file type restriction first
        try {
            $validated = $request->validate([
                'image' => 'nullable|file|max:8192',
                'status' => 'nullable|boolean',
            ]);
            Log::info('Basic validation passed');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            throw $e;
        }

        // Nếu có upload ảnh mới: xóa ảnh cũ và cập nhật
        if ($request->hasFile('image')) {
            Log::info('Processing image upload for banner', ['id' => $id]);
            
            if ($banner->public_id) {
                try {
                    if (Storage::disk('public')->exists($banner->public_id)) {
                        Storage::disk('public')->delete($banner->public_id);
                        Log::info('Deleted old banner file', ['public_id' => $banner->public_id]);
                    } else {
                        Log::warning('Old banner file not found', ['public_id' => $banner->public_id]);
                    }
                } catch (\Throwable $ex) {
                    Log::error('Failed to delete old banner file', ['public_id' => $banner->public_id, 'error' => $ex->getMessage()]);
                }
            }
            
            try {
                $path = $request->file('image')->store('banners', 'public');
                $url = Storage::disk('public')->url($path);
                // Nếu $url đã là tuyệt đối thì giữ nguyên, nếu tương đối thì chuẩn hóa thành tuyệt đối
                $banner->image_url = str_starts_with($url, 'http') ? $url : url($url);
                $banner->public_id = $path;
                Log::info('Stored new banner file', ['id' => $banner->id, 'public_id' => $path, 'image_url' => $banner->image_url]);
            } catch (\Exception $e) {
                Log::error('Failed to store banner image', ['error' => $e->getMessage()]);
                return response()->json([
                    'message' => 'Lỗi khi lưu ảnh: ' . $e->getMessage()
                ], 500);
            }
        }

        if ($request->has('status')) {
            // dùng boolean() để nhận cả '0' là false
            $banner->status = $request->boolean('status');
        }

        $banner->save();
        
        // Xóa cache để trang chủ nhận banner mới ngay lập tức
        Cache::forget('banners_active');
        
        // Log để debug
        Log::info('Banner updated and cache cleared', ['id' => $banner->id, 'image_url' => $banner->image_url]);

        return response()->json([
            'message' => 'Cập nhật banner thành công',
            'data' => $banner,
        ]);
    }
}
