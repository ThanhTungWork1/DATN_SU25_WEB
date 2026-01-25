<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class CheckDuplicateOrderItems extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:duplicate-order-items';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kiểm tra duplicate order_items trong database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Kiểm tra duplicate order_items...');

        // Kiểm tra order_items có cùng variant_id trong cùng order
        $duplicates = OrderItem::select('order_id', 'variant_id', DB::raw('COUNT(*) as count'))
            ->groupBy('order_id', 'variant_id')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('✅ Không có duplicate order_items');
        } else {
            $this->warn("⚠️  Tìm thấy {$duplicates->count()} trường hợp duplicate:");
            
            foreach ($duplicates as $duplicate) {
                $this->line("  - Order #{$duplicate->order_id}, Variant #{$duplicate->variant_id}: {$duplicate->count} lần");
                
                // Lấy chi tiết các order_items duplicate
                $items = OrderItem::where('order_id', $duplicate->order_id)
                    ->where('variant_id', $duplicate->variant_id)
                    ->get();
                
                foreach ($items as $item) {
                    $this->line("    * ID: {$item->id}, Quantity: {$item->quantity}, Price: {$item->price}, Created: {$item->created_at}");
                }
            }
        }

        // Kiểm tra top products trong category "Áo thun nam" (ID = 1)
        $this->info("\n🔍 Kiểm tra top products trong category 'Áo thun nam':");
        
        $categoryId = 1; // Áo thun nam
        $variantIds = ProductVariant::whereHas('product', function($q) use ($categoryId) {
            $q->where('category_id', $categoryId);
        })->pluck('id');

        if ($variantIds->isEmpty()) {
            $this->error("❌ Không tìm thấy variants trong category {$categoryId}");
            return;
        }

        $this->info("📦 Tìm thấy {$variantIds->count()} variants trong category {$categoryId}");

        // Lấy order_items cho các variants này
        $orderItems = OrderItem::whereIn('variant_id', $variantIds)
            ->with(['order', 'variant.product'])
            ->whereHas('order', function($q) {
                $q->whereIn('status', ['delivered', 'completed']);
            })
            ->get();

        $this->info("📊 Tổng số order_items: {$orderItems->count()}");

        // Group theo product để xem có bao nhiêu sản phẩm thật
        $products = $orderItems->groupBy(function($item) {
            return optional($item->variant->product)->id;
        })->filter(function($items, $productId) {
            return !is_null($productId);
        });

        $this->info("🎯 Số sản phẩm thật: {$products->count()}");

        foreach ($products as $productId => $items) {
            $product = $items->first()->variant->product;
            $totalQuantity = $items->sum('quantity');
            $totalRevenue = $items->sum(function($item) {
                return $item->quantity * $item->price * 1000;
            });
            
            $this->line("  - Product #{$productId}: {$product->name}");
            $this->line("    * Tổng quantity: {$totalQuantity}");
            $this->line("    * Tổng revenue: " . number_format($totalRevenue) . " VND");
            $this->line("    * Số order_items: {$items->count()}");
        }

        $this->info("\n🔍 Kiểm tra hoàn tất!");
    }
}
