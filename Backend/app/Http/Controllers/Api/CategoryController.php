<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class CategoryController extends Controller
{
    // Lấy danh sách category
    public function index()
    {
        $categories = Category::select('id', 'name', 'slug', 'description')->get();
        return Response::json([
            'data' => $categories,
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }

    // Lấy chi tiết 1 category
    public function show($id)
    {
        $category = Category::select('id', 'name', 'slug', 'description')->find($id);
        if (!$category) {
            return Response::json([
                'message' => 'Category not found',
                'status_code' => 404
            ], 404);
        }
        return Response::json([
            'data' => $category,
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }
}
