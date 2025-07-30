<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;

class InventoryLogController extends Controller
{
    public function index()
    {
        $logs = InventoryLog::with(['variant.product', 'user'])
            ->latest()
            ->paginate(20); // hoặc ->get() nếu không cần phân trang

        return response()->json($logs);
    }
}
