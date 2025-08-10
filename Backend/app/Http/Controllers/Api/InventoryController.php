<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Models\ProductVariant;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $variant = ProductVariant::find($request->product_variant_id);
            $variant->increment('stock', $request->quantity);

            InventoryLog::create([
                'product_variant_id' => $request->product_variant_id,
                'type' => 'import',
                'quantity' => $request->quantity,
                'note' => $request->note,
                'created_by' => auth()->id()
            ]);
        });

        return response()->json(['message' => 'Nhập kho thành công']);
    }

    public function export(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $variant = ProductVariant::findOrFail($request->product_variant_id);

            if ($variant->stock < $request->quantity) {
                abort(400, 'Tồn kho không đủ để xuất');
            }

            $variant->decrement('stock', $request->quantity);

            InventoryLog::create([
                'product_variant_id' => $request->product_variant_id,
                'type' => 'export',
                'quantity' => $request->quantity,
                'note' => $request->note,
                'created_by' => auth()->id()
            ]);
        });

        return response()->json(['message' => 'Xuất kho thành công']);
    }

    public function lowStock()
    {
        $variants = ProductVariant::where('stock', '<=', 5)->with('product')->get();
        return response()->json($variants);
    }
    public function index()
    {
        $inventories = ProductVariant::with(['product', 'color', 'size'])
            ->select('id', 'product_id', 'color_id', 'size_id', 'stock')
            ->get();

        return response()->json($inventories);
    }

}

