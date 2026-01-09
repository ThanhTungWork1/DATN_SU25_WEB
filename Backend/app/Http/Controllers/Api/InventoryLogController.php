<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InventoryLogController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryLog::with(['variant.product', 'user']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('product_id')) {
            $query->whereHas('variant', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        if ($request->has(['from_date', 'to_date'])) {
            $from = Carbon::parse($request->from_date)->startOfDay();
            $to = Carbon::parse($request->to_date)->endOfDay();
            $query->whereBetween('created_at', [$from, $to]);
        }

        return response()->json($query->latest()->paginate(20));
    }
}
