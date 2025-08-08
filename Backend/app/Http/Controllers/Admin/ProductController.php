<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str; // THÊM: Import Str để tạo slug

class ProductController extends Controller
{
     public function index(Request $request)
    {
        \Log::info('🔍 [BACKEND DEBUG] Admin products index called');
        \Log::info('🔍 [BACKEND DEBUG] Request parameters:', $request->all());
        
        $query = Product::query();

        // THÊM MỚI: Logic xử lý tìm kiếm
        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            // Tìm ở cột 'name'
            $query->where('name', 'like', '%' . $searchTerm . '%');
        }

        // Sắp xếp theo ID tăng dần và phân trang 5 sản phẩm
        $products = $query->orderBy('id', 'asc')->paginate(5);
        
        // Đảm bảo accessors được load
        $products->getCollection()->transform(function ($product) {
            \Log::info('🔍 [BACKEND DEBUG] Processing product ID: ' . $product->id);
            \Log::info('🔍 [BACKEND DEBUG] Raw image field: ' . $product->image);
            \Log::info('🔍 [BACKEND DEBUG] Image URL accessor: ' . $product->image_url);
            return $product;
        });
        
        \Log::info('🔍 [BACKEND DEBUG] Products found:', $products->toArray());
        
        return $products;
    }
    public function store(Request $request)
    {
        \Log::info('🔍 [BACKEND DEBUG] Product store method called');
        \Log::info('🔍 [BACKEND DEBUG] Request data:', $request->all());
        
        try {
            $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|boolean',
            'description' => 'nullable|string',
            'old_price' => 'nullable|numeric|min:0',
            'material' => 'nullable|string',
            // 'discount' => 'nullable|numeric|min:0',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'sold' => 'nullable|integer|min:0',
                    'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

             // Validation cho dữ liệu biến thể
            'variants' => 'required|string', // Vẫn nhận chuỗi JSON
            'variant_images' => 'nullable|array', // Mảng chứa các file ảnh của biến thể
            'variant_images.*' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:2048' // Validate từng file trong mảng
        ]);

        $variantsData = json_decode($validatedData['variants'], true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($variantsData) || count($variantsData) < 1) {
            return response()->json(['message' => 'Định dạng biến thể không hợp lệ.'], 422);
        }

        $product = DB::transaction(function () use ($validatedData, $variantsData, $request) {
            \Log::info('🔍 [BACKEND DEBUG] Starting DB transaction');
            \Log::info('🔍 [BACKEND DEBUG] Validated data:', $validatedData);
            \Log::info('🔍 [BACKEND DEBUG] Variants data:', $variantsData);
            // --- SỬA LỖI: Xây dựng đối tượng Product một cách tường minh ---
            $product = new Product();
            $product->name = $validatedData['name'];
            $product->price = $validatedData['price'];
            $product->category_id = $validatedData['category_id'];
            $product->status = $validatedData['status'];
            $product->description = $validatedData['description'] ?? null;
            $product->old_price = $validatedData['old_price'] ?? null;
            $product->material = $validatedData['material'] ?? null;
            $product->sold = $validatedData['sold'] ?? 0;

            // Tự động tạo slug nếu người dùng không nhập
            $product->slug = $validatedData['slug'] ?? Str::slug($validatedData['name']);

            // Xử lý upload file và gán đường dẫn
            if ($request->hasFile('image')) {
                $product->image = $request->file('image')->store('products', 'public');
            }
            if ($request->hasFile('hover_image')) {
                $product->hover_image = $request->file('hover_image')->store('products', 'public');
            }

            // 1. Lưu sản phẩm cha vào DB
            \Log::info('🔍 [BACKEND DEBUG] About to save product:', $product->toArray());
            $product->save();
            \Log::info('🔍 [BACKEND DEBUG] Product saved successfully with ID: ' . $product->id);

           // Logic tạo biến thể để xử lý ảnh
            foreach ($variantsData as $index => $variant) {
                \Log::info("🔍 [BACKEND DEBUG] Processing variant {$index}:", $variant);
                
                // Kiểm tra xem có file ảnh nào được gửi lên cho biến thể ở vị trí $index không
                if ($request->hasFile("variant_images.{$index}")) {
                    // Lưu file và lấy đường dẫn
                    $imagePath = $request->file("variant_images.{$index}")->store('variants', 'public');
                    \Log::info("🔍 [BACKEND DEBUG] Variant {$index} image saved to: {$imagePath}");
                    // Gán đường dẫn vào dữ liệu của biến thể
                    $variant['image'] = $imagePath;
                } else {
                    // Nếu không có file mới, giữ lại ảnh cũ (nếu có) hoặc đặt là null
                    $variant['image'] = $variant['image'] ?? null;
                    \Log::info("🔍 [BACKEND DEBUG] Variant {$index} no new image, using: " . ($variant['image'] ?? 'null'));
                }

                \Log::info("🔍 [BACKEND DEBUG] About to create variant with data:", $variant);
                $product->variants()->create($variant);
                \Log::info("🔍 [BACKEND DEBUG] Variant {$index} created successfully");
            }
            return $product;
        });

        return response()->json($product->load('variants'), 201);
        } catch (\Exception $e) {
            \Log::error('🔍 [BACKEND DEBUG] Product store error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function show($id)
    {
        \Log::info('🔍 [BACKEND DEBUG] Product show method called with ID: ' . $id);
        try {
            $product = Product::with(['variants.color', 'variants.size'])->findOrFail($id);
            \Log::info('🔍 [BACKEND DEBUG] Product found:', $product->toArray());
            return $product;
        } catch (\Exception $e) {
            \Log::error('🔍 [BACKEND DEBUG] Product show error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Logic cập nhật cũng nên được làm tường minh tương tự, nhưng tạm thời giữ nguyên để giải quyết lỗi tạo mới trước
        // (Code update hiện tại của bạn đã khá tốt)
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'status' => 'sometimes|required|boolean',
            'description' => 'nullable|string',
            'old_price' => 'nullable|numeric|min:0',
            'material' => 'nullable|string',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'sold' => 'nullable|integer|min:0',
            'variants' => 'sometimes|required|string',
            'variant_images' => 'nullable|array', // Mảng chứa các file ảnh của biến thể
            'variant_images.*' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:2048', // Validate từng file trong mảng
                    'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        DB::transaction(function () use ($request, $product, $validatedData) {
            $productDataForUpdate = collect($validatedData)->except(['variants', 'image', 'hover_image'])->toArray();

            if ($request->hasFile('image')) {
                if ($product->image) Storage::disk('public')->delete($product->image);
                $productDataForUpdate['image'] = $request->file('image')->store('products', 'public');
            }
            if ($request->hasFile('hover_image')) {
                if ($product->hover_image) Storage::disk('public')->delete($product->hover_image);
                $productDataForUpdate['hover_image'] = $request->file('hover_image')->store('products', 'public');
            }

            $product->update($productDataForUpdate);

            if ($request->has('variants')) {
                $variants = json_decode($request->input('variants'), true);
                $incomingVariantIds = collect($variants)->pluck('id')->filter();
             // Xóa các biến thể không còn được gửi lên
                $product->variants()->whereNotIn('id', $incomingVariantIds)->delete();

                // Cập nhật hoặc Tạo mới các biến thể
                foreach ($variants as $index => $variantData) {
                    // Kiểm tra xem có file ảnh mới cho biến thể này không
                    if ($request->hasFile("variant_images.{$index}")) {
                        // Tìm biến thể cũ để xóa ảnh cũ (nếu có)
                        if (isset($variantData['id'])) {
                            $oldVariant = $product->variants()->find($variantData['id']);
                            if ($oldVariant && $oldVariant->image) {
                                Storage::disk('public')->delete($oldVariant->image);
                            }
                        }
                        // Lưu ảnh mới và cập nhật đường dẫn
                        $variantData['image'] = $request->file("variant_images.{$index}")->store('variants', 'public');
                    }

                    $product->variants()->updateOrCreate(
                        ['id' => $variantData['id'] ?? null],
                        $variantData
                    );
                }
            }
        });

        return response()->json($product->load('variants'));
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image) Storage::disk('public')->delete($product->image);
        if ($product->hover_image) Storage::disk('public')->delete($product->hover_image);
        $product->delete();

        return response()->json(['message' => 'Xóa sản phẩm thành công!']);
    }

    /**
     * Tìm kiếm sản phẩm với các filter
     */
    public function search(Request $request)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size']);

        // Tìm kiếm theo tên hoặc mô tả
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filter theo danh mục
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter theo giá
        if ($request->has('min_price') && !empty($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price') && !empty($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter theo trạng thái
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter theo màu sắc
        if ($request->has('color_id') && !empty($request->color_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('color_id', $request->color_id);
            });
        }

        // Filter theo kích thước
        if ($request->has('size_id') && !empty($request->size_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('size_id', $request->size_id);
            });
        }

        // Filter theo chất liệu
        if ($request->has('materials') && !empty($request->materials)) {
            $materials = explode(',', $request->materials);
            $query->whereIn('material', $materials);
        }

        // Filter theo giảm giá
        if ($request->has('has_discount') && $request->has_discount !== '') {
            if ($request->has_discount) {
                $query->whereNotNull('old_price')
                    ->where('old_price', '>', DB::raw('price'));
            } else {
                $query->where(function ($q) {
                    $q->whereNull('old_price')
                        ->orWhere('old_price', '<=', DB::raw('price'));
                });
            }
        }

        // Filter theo khoảng giảm giá
        if ($request->has('min_discount') && !empty($request->min_discount)) {
            $query->whereRaw('((old_price - price) / old_price * 100) >= ?', [$request->min_discount]);
        }
        if ($request->has('max_discount') && !empty($request->max_discount)) {
            $query->whereRaw('((old_price - price) / old_price * 100) <= ?', [$request->max_discount]);
        }

        // Filter theo tồn kho
        if ($request->has('in_stock') && $request->in_stock !== '') {
            if ($request->in_stock) {
                $query->whereHas('variants', function ($q) {
                    $q->where('stock', '>', 0);
                });
            } else {
                $query->whereDoesntHave('variants', function ($q) {
                    $q->where('stock', '>', 0);
                });
            }
        }

        // Phân trang
        $perPage = $request->get('per_page', 12);
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'filters' => [
                'search' => $request->search ?? null,
                'category_id' => $request->category_id ?? null,
                'min_price' => $request->min_price ?? null,
                'max_price' => $request->max_price ?? null,
                'status' => $request->status ?? null,
                'color_id' => $request->color_id ?? null,
                'size_id' => $request->size_id ?? null,
                'materials' => $request->materials ?? null,
                'has_discount' => $request->has_discount ?? null,
                'min_discount' => $request->min_discount ?? null,
                'max_discount' => $request->max_discount ?? null,
                'in_stock' => $request->in_stock ?? null,
            ]
        ]);
    }
}