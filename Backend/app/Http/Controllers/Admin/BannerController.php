<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $banners]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'status' => 'required|boolean',
        ]);

        try {
            $banner = new Banner();
            
            // Upload image
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('banners', 'public');
                $banner->image_url = asset('storage/' . $imagePath);
                $banner->public_id = $imagePath; // Store path for deletion
            }
            
            $banner->status = $validatedData['status'];
            $banner->save();

            // Clear cache
            Cache::forget('banners_all');

            return response()->json([
                'message' => 'Thêm banner thành công!',
                'data' => $banner
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi thêm banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $banner = Banner::findOrFail($id);
        return response()->json(['data' => $banner]);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);
        
        $validatedData = $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'status' => 'sometimes|required|boolean',
        ]);

        try {
            // Update image if provided
            if ($request->hasFile('image')) {
                // Delete old image
                if ($banner->public_id && Storage::disk('public')->exists($banner->public_id)) {
                    Storage::disk('public')->delete($banner->public_id);
                }
                
                // Upload new image
                $imagePath = $request->file('image')->store('banners', 'public');
                $banner->image_url = asset('storage/' . $imagePath);
                $banner->public_id = $imagePath;
            }
            
            // Update status if provided
            if (isset($validatedData['status'])) {
                $banner->status = $validatedData['status'];
            }
            
            $banner->save();

            // Clear cache
            Cache::forget('banners_all');

            return response()->json([
                'message' => 'Cập nhật banner thành công!',
                'data' => $banner
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            
            // Delete image file
            if ($banner->public_id && Storage::disk('public')->exists($banner->public_id)) {
                Storage::disk('public')->delete($banner->public_id);
            }
            
            $banner->delete();

            // Clear cache
            Cache::forget('banners_all');

            return response()->json([
                'message' => 'Xóa banner thành công!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

