<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\OrderItem;
use App\Models\ProductVariant;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        OrderItem::truncate();
        Schema::enableForeignKeyConstraints();

        $variant1 = ProductVariant::with(['product', 'color', 'size'])->find(1);
        $variant2 = ProductVariant::with(['product', 'color', 'size'])->find(2);
        $variant3 = ProductVariant::with(['product', 'color', 'size'])->find(3);

        if ($variant1 && $variant2) {
            OrderItem::create([
                'order_id' => 1,
                'variant_id' => $variant1->id, // SỬA LẠI TẠI ĐÂY
                'quantity' => 2,
                'price' => $variant1->price,
                'product_name' => $variant1->product->name,
                'variant_color_name' => $variant1->color->name,
                'variant_size_name' => $variant1->size->name,
                'variant_sku' => $variant1->sku,
                'variant_image' => $variant1->image,
            ]);

            OrderItem::create([
                'order_id' => 1,
                'variant_id' => $variant2->id, // SỬA LẠI TẠI ĐÂY
                'quantity' => 1,
                'price' => $variant2->price,
                'product_name' => $variant2->product->name,
                'variant_color_name' => $variant2->color->name,
                'variant_size_name' => $variant2->size->name,
                'variant_sku' => $variant2->sku,
                'variant_image' => $variant2->image,
            ]);
        }

        if ($variant3) {
            OrderItem::create([
                'order_id' => 2,
                'variant_id' => $variant3->id, // SỬA LẠI TẠI ĐÂY
                'quantity' => 5,
                'price' => $variant3->price,
                'product_name' => $variant3->product->name,
                'variant_color_name' => $variant3->color->name,
                'variant_size_name' => $variant3->size->name,
                'variant_sku' => $variant3->sku,
                'variant_image' => $variant3->image,
            ]);
        }
    }
}