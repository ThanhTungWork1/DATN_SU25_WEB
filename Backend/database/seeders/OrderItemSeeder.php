<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB; // Import DB facade

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xóa dữ liệu cũ để làm mới
        Schema::disableForeignKeyConstraints();
        OrderItem::truncate();
        Schema::enableForeignKeyConstraints();

        // Lấy các biến thể sản phẩm có sẵn
        // Lấy 3 biến thể đầu tiên để đảm bảo chúng tồn tại
        $variants = ProductVariant::with(['product', 'color', 'size'])->take(3)->get();

        // Nếu không có đủ 3 biến thể, không chạy seeder
        if ($variants->count() < 3) {
            $this->command->info('Không có đủ biến thể sản phẩm để tạo dữ liệu mẫu cho đơn hàng.');
            return;
        }

        $variant1 = $variants[0];
        $variant2 = $variants[1];
        $variant3 = $variants[2];

        // --- BẮT ĐẦU XỬ LÝ ĐƠN HÀNG #1 ---
        $order1 = Order::find(1);
        if ($order1) {
            // Thêm sản phẩm vào đơn hàng
            OrderItem::create([
                'order_id' => 1, 'variant_id' => $variant1->id, 'quantity' => 2, 'price' => $variant1->price,
                'product_name' => $variant1->product->name, 'variant_color_name' => $variant1->color->name,
                'variant_size_name' => $variant1->size->name, 'variant_sku' => $variant1->sku, 'variant_image' => $variant1->image,
            ]);
            OrderItem::create([
                'order_id' => 1, 'variant_id' => $variant2->id, 'quantity' => 1, 'price' => $variant2->price,
                'product_name' => $variant2->product->name, 'variant_color_name' => $variant2->color->name,
                'variant_size_name' => $variant2->size->name, 'variant_sku' => $variant2->sku, 'variant_image' => $variant2->image,
            ]);

            // Tự động tính toán và cập nhật lại tổng tiền cho đơn hàng
            $totalAmount = $order1->items()->sum(DB::raw('price * quantity'));
            $finalAmount = ($totalAmount + $order1->shipping_fee) - $order1->discount_amount;
            $order1->update([
                'total_amount' => $totalAmount,
                'final_amount' => $finalAmount,
            ]);
        }
        // --- KẾT THÚC XỬ LÝ ĐƠN HÀNG #1 ---


        // --- BẮT ĐẦU XỬ LÝ ĐƠN HÀNG #2 ---
        $order2 = Order::find(2);
        if ($order2) {
            // Thêm sản phẩm vào đơn hàng
            OrderItem::create([
                'order_id' => 2, 'variant_id' => $variant3->id, 'quantity' => 5, 'price' => $variant3->price,
                'product_name' => $variant3->product->name, 'variant_color_name' => $variant3->color->name,
                'variant_size_name' => $variant3->size->name, 'variant_sku' => $variant3->sku, 'variant_image' => $variant3->image,
            ]);

            // Tự động tính toán và cập nhật lại tổng tiền cho đơn hàng
            $totalAmount = $order2->items()->sum(DB::raw('price * quantity'));
            $finalAmount = ($totalAmount + $order2->shipping_fee) - $order2->discount_amount;
            $order2->update([
                'total_amount' => $totalAmount,
                'final_amount' => $finalAmount,
            ]);
        }
        // --- KẾT THÚC XỬ LÝ ĐƠN HÀNG #2 ---
    }
}