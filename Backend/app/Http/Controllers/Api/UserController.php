<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Order;

class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }

    public function show($id)
    {
        return User::findOrFail($id);
    }

    // ✅ Đặt đúng tên hàm store user hoặc chuyển qua OrderController
    public function store(Request $request)
    {
        // Nếu đây là tạo order, nên tách ra một controller khác
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string',
            'is_paid' => 'required|boolean',
            'total_amount' => 'required|numeric',
            'shipping_fee' => 'required|numeric',
            'items' => 'required|array',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
        ]);

        $order = Order::create([
            'user_id' => $data['user_id'],
            'status' => $data['status'],
            'is_paid' => $data['is_paid'],
            'total_amount' => $data['total_amount'],
            'shipping_fee' => $data['shipping_fee']
        ]);

        foreach ($data['items'] as $item) {
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'variant_id' => $item['variant_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price']
            ]);
        }

        return response()->json($order->load('items'), 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $id,
            'gender' => 'nullable|in:male,female,other',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'role' => 'sometimes|in:0,1',
            'status' => 'nullable|boolean',
            'is_verified' => 'nullable|boolean',
            'password' => 'nullable|min:6'
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        User::destroy($id);

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
