<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    /**
     * Lấy danh sách tất cả kích thước
     */
    public function index()
    {
        $sizes = Size::withCount(['variants' => function ($query) {
            $query->whereHas('product', function ($q) {
                $q->where('status', true);
            });
        }])->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách kích thước thành công',
            'data' => $sizes
        ]);
    }

    /**
     * Lấy thông tin kích thước theo ID
     */
    public function show($id)
    {
        $size = Size::withCount(['variants' => function ($query) {
            $query->whereHas('product', function ($q) {
                $q->where('status', true);
            });
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin kích thước thành công',
            'data' => $size
        ]);
    }

    /**
     * Lấy kích thước có sản phẩm
     */
    public function withProducts()
    {
        $sizes = Size::withCount(['variants' => function ($query) {
            $query->whereHas('product', function ($q) {
                $q->where('status', true);
            });
        }])
            ->having('variants_count', '>', 0)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy kích thước có sản phẩm thành công',
            'data' => $sizes
        ]);
    }
}
