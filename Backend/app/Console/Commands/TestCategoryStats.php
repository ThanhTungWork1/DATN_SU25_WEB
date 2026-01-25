<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class TestCategoryStats extends Command
{
    protected $signature = 'test:category-stats {category_id?}';
    protected $description = 'Test category statistics logic';

    public function handle()
    {
        $categoryId = $this->argument('category_id');
        
        if (!$categoryId) {
            $category = Category::first();
            $categoryId = $category->id;
            $this->info("🔍 Không có category_id, sử dụng category đầu tiên: {$category->name} (ID: {$categoryId})");
        } else {
            $category = Category::find($categoryId);
            if (!$category) {
                $this->error("❌ Không tìm thấy category với ID: {$categoryId}");
                return;
            }
            $this->info("🔍 Testing category: {$category->name} (ID: {$categoryId})");
        }

        $this->info("\n📊 BẮT ĐẦU TEST CATEGORY STATISTICS...");

        // 1. Lấy product IDs trong category
        $productIds = $category->products()->pluck('id');
        $this->info("📦 Products trong category: " . $productIds->count());
        $this->info("  - Product IDs: " . $productIds->join(', '));

        if ($productIds->isEmpty()) {
            $this->warn("⚠️ Không có products trong category này!");
            return;
        }

        // 2. Lấy variant IDs
        $variantIds = ProductVariant::whereIn('product_id', $productIds)->pluck('id');
        $this->info("🎯 Variants thuộc products: " . $variantIds->count());
        $this->info("  - Variant IDs: " . $variantIds->take(5)->join(', ') . ($variantIds->count() > 5 ? '...' : ''));

        if ($variantIds->isEmpty()) {
            $this->warn("⚠️ Không có variants cho products trong category này!");
            return;
        }

        // 3. Lấy order items
        $orderItems = OrderItem::whereIn('variant_id', $variantIds)
            ->with(['order', 'variant.product'])
            ->whereHas('order', function($q) {
                $q->whereIn('status', ['delivered', 'completed']);
            })
            ->get();

        $this->info("📋 Order items (delivered/completed): " . $orderItems->count());

        if ($orderItems->isEmpty()) {
            $this->warn("⚠️ Không có order items cho category này!");
            return;
        }

        // 4. Test logic top products
        $this->info("\n🎯 TEST LOGIC TOP PRODUCTS:");
        
        $topProducts = $orderItems
            ->groupBy(function($item) { 
                return optional($item->variant->product)->id; 
            })
            ->filter(function($items, $productId) { 
                return !is_null($productId); 
            })
            ->map(function($items) {
                $product = optional($items->first()->variant->product);
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sold_quantity' => $items->sum('quantity'),
                    'revenue' => $items->sum(function($item) {
                        return $item->quantity * $item->price * 1000;
                    })
                ];
            })
            ->filter(function($product) { 
                // 🔧 FIX: Chỉ lấy sản phẩm có bán được (sold_quantity > 0)
                return $product['sold_quantity'] > 0; 
            })
            ->sortByDesc('sold_quantity')
            ->take(5)
            ->values()
            ->toArray();

        $this->info("✅ Sản phẩm có bán (sold_quantity > 0): " . count($topProducts));
        
        foreach ($topProducts as $index => $product) {
            $this->info("  [{$index}] ID: {$product['id']}, Name: '{$product['name']}', Qty: {$product['sold_quantity']}, Revenue: {$product['revenue']}");
        }

        // 5. So sánh với logic cũ (không filter sold_quantity > 0)
        $this->info("\n🔍 SO SÁNH VỚI LOGIC CŨ (không filter sold_quantity > 0):");
        
        $oldTopProducts = $orderItems
            ->groupBy(function($item) { 
                return optional($item->variant->product)->id; 
            })
            ->filter(function($items, $productId) { 
                return !is_null($productId); 
            })
            ->map(function($items) {
                $product = optional($items->first()->variant->product);
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sold_quantity' => $items->sum('quantity'),
                    'revenue' => $items->sum(function($item) {
                        return $item->quantity * $item->price * 1000;
                    })
                ];
            })
            ->sortByDesc('sold_quantity')
            ->take(5)
            ->values()
            ->toArray();

        $this->info("❌ Sản phẩm tất cả (bao gồm 0 SP): " . count($oldTopProducts));
        
        foreach ($oldTopProducts as $index => $product) {
            $status = $product['sold_quantity'] > 0 ? "✅" : "❌";
            $this->info("  {$status} [{$index}] ID: {$product['id']}, Name: '{$product['name']}', Qty: {$product['sold_quantity']}, Revenue: {$product['revenue']}");
        }

        $this->info("\n🎉 TEST HOÀN THÀNH!");
        
        if (count($topProducts) !== count($oldTopProducts)) {
            $this->info("✅ Logic mới hoạt động đúng: Lọc bỏ sản phẩm 0 SP");
        } else {
            $this->warn("⚠️ Logic mới và cũ giống nhau - có thể chưa được áp dụng");
        }
    }
}
