<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;

class DashboardController extends Controller
{
    public function index()
    {
        $data = [
            'total_users' => User::count(),
            'total_orders' => Order::count(),
            'total_products' => Product::count(),
            'latest_users' => User::latest()->take(5)->get(),
            'latest_orders' => Order::latest()->take(5)->get(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ], 200);
    }
}
