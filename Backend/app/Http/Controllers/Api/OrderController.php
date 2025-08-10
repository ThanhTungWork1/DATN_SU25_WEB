<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Enums\OrderStatus;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {
    }

    public function index()
    {
        return Order::with('items.variant.product')->paginate();
    }

    public function add(Request $request)
    {
        return $this->store($request);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|in:' . implode(',', OrderStatus::all()),
            'is_paid' => 'required|boolean',
            'total_amount' => 'required|numeric',
            'shipping_fee' => 'required|numeric',
            'sold_number' => 'nullable|numeric',
            'items' => 'required|array',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric'
        ]);

        // Kiểm tra tồn kho
        foreach ($data['items'] as $item) {
            $variant = \App\Models\ProductVariant::find($item['variant_id']);
            if (!$variant || $variant->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Sản phẩm không đủ tồn kho hoặc không tồn tại'
                ], 422);
            }
        }

        // Tạo đơn hàng
        $order = Order::create([
            'user_id' => $data['user_id'],
            'status' => $data['status'],
            'is_paid' => $data['is_paid'],
            'total_amount' => $data['total_amount'],
            'shipping_fee' => $data['shipping_fee'],
            'sold_number' => $data['sold_number'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            // Trừ tồn kho
            $variant = \App\Models\ProductVariant::with(['product', 'color', 'size'])->find($item['variant_id']);
            $variant->stock -= $item['quantity'];
            $variant->save();

            if ($data['status'] === OrderStatus::CONFIRMED) {
                $variant->decrement('stock', $item['quantity']);
            }

            OrderItem::create([
                'order_id' => $order->id,
                'variant_id' => $item['variant_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                // Lưu snapshot thông tin sản phẩm
                'product_name' => $variant->product->name ?? 'Không có tên',
                'variant_color_name' => $variant->color->name ?? 'Không có',
                'variant_size_name' => $variant->size->name ?? 'Không có',
                'variant_sku' => $variant->sku ?? 'Không có',
                'variant_image' => $variant->image ?? null,
            ]);
        }

        // QR thanh toán MB Bank
        $mbBankCode = '970422';
        $mbAccount = '0686809012005';
        $mbAccountName = 'LE KHAI HOAN';
        $transferNote = 'ORDER_' . $order->id;
        $qrTemplate = 'compact'; // Hoặc 'print', 'vertical'
        $amount = $order->total_amount + $order->shipping_fee;
        $qrImageUrl = "https://img.vietqr.io/image/{$mbBankCode}-{$mbAccount}-{$qrTemplate}.png?amount={$amount}&addInfo={$transferNote}";

        return response()->json([
            'message' => 'Đặt hàng thành công, vui lòng chuyển khoản đúng thông tin bên dưới',
            'order_id' => $order->id,
            'amount' => $amount,
            'bank_transfer' => [
                'bank_name' => 'MB Bank',
                'account_number' => $mbAccount,
                'account_name' => $mbAccountName,
                'transfer_note' => $transferNote,
                'qr_code_url' => $qrImageUrl
            ],
            'order' => $order->load('items.variant.product')
        ], 201);
    }

    public function show($id)
    {
        return Order::with('items.variant.product')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'sometimes|string|in:' . implode(',', OrderStatus::all()),
            'is_paid' => 'sometimes|boolean',
        ]);

        $order = Order::findOrFail($id);
        $order->update($data);

        return $order->load('items.variant.product');
    }

    public function destroy($id)
    {
        return Order::destroy($id);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::with('items.variant')->findOrFail($id);

        $oldStatus = $order->status;
        $newStatus = $request->input('status');

        if (!in_array($newStatus, OrderStatus::all())) {
            return response()->json(['message' => 'Trạng thái không hợp lệ'], 400);
        }

        DB::transaction(function () use ($order, $oldStatus, $newStatus) {
            if ($oldStatus === OrderStatus::PENDING && $newStatus === OrderStatus::CONFIRMED) {
                foreach ($order->items as $item) {
                    $item->variant->decrement('stock', $item->quantity);
                }
            }

            if ($oldStatus === OrderStatus::CONFIRMED && $newStatus === OrderStatus::CANCELED) {
                foreach ($order->items as $item) {
                    $item->variant->increment('stock', $item->quantity);
                }
            }

            $order->update(['status' => $newStatus]);
        });

        return response()->json(['message' => 'Cập nhật trạng thái thành công']);
    }

    public function markAsPaid($id)
    {
        $order = Order::findOrFail($id);

        if ($order->is_paid) {
            return response()->json(['message' => 'Đơn hàng đã được thanh toán'], 400);
        }

        $order->update([
            'is_paid' => true,
            'status' => OrderStatus::CONFIRMED
        ]);

        return response()->json([
            'message' => 'Xác nhận thanh toán thành công',
            'order' => $order->load('items.variant.product')
        ]);
    }
}
