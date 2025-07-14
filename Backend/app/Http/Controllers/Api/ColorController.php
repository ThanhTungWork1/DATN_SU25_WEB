<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;

class ColorController extends Controller
{
    public function index()
    {
        $colors = Color::withCount([
            'productVariants' => function ($query) {

                $query->whereHas('product', function ($q) {
                    $q->where('status', true);
                });
            }
        ])->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách màu sắc thành công',
            'data' => $colors
        ]);
    }

    /**
     * Lấy thông tin màu sắc theo ID
     */
    public function show($id)
    {
        $color = Color::withCount([
            'productVariants' => function ($query) {

                $query->whereHas('product', function ($q) {
                    $q->where('status', true);
                });
            }
        ])->findOrFail($id);


        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin màu sắc thành công',
            'data' => $color
        ]);
    }

    /**
     * Lấy màu sắc có sản phẩm
     */
    public function withProducts()
    {
        $colors = Color::withCount([
            'productVariants' => function ($query) {

                $query->whereHas('product', function ($q) {
                    $q->where('status', true);
                });
            }
        ])
            ->having('variants_count', '>', 0)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy màu sắc có sản phẩm thành công',
            'data' => $colors
        ]);
    }
}