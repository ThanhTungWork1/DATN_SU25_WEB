<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
      
        ]);

        $product = Product::create($data);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }
    public function add(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'status' => 'boolean',
        ]);

        $product = Product::create($data);

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product
        ], 201);
    }


    public function show($id)
    {
        return Product::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'status' => 'boolean',
        ]);

        $product->update($data);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        return Product::destroy($id);
    }
}