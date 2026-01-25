<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OrderItem;
use App\Models\Order;

class UpdateProductSoldCount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:update-sold-count {--product-id= : Update specific product ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update product sold count based on actual delivered/completed orders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $productId = $this->option('product-id');
        
        if ($productId) {
            $this->updateSingleProduct($productId);
        } else {
            $this->updateAllProducts();
        }
    }

    private function updateSingleProduct($productId)
    {
        $product = Product::find($productId);
        if (!$product) {
            $this->error("Product ID {$productId} not found!");
            return;
        }

        $this->info("Updating sold count for product: {$product->name} (ID: {$productId})");
        
        $variantIds = $product->variants->pluck('id');
        $oldSold = $product->sold;
        
        if ($variantIds->count() > 0) {
            $newSold = OrderItem::whereIn('variant_id', $variantIds)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->whereIn('orders.status', ['delivered', 'completed'])
                ->sum('order_items.quantity');
        } else {
            $newSold = 0;
        }
        
        $product->sold = (int) $newSold;
        $product->save();
        
        $this->info("Updated: {$oldSold} -> {$newSold}");
    }

    private function updateAllProducts()
    {
        $this->info("Updating sold count for all products...");
        
        $products = Product::with('variants')->get();
        $bar = $this->output->createProgressBar($products->count());
        
        $updatedCount = 0;
        $totalOldSold = 0;
        $totalNewSold = 0;
        
        foreach ($products as $product) {
            $variantIds = $product->variants->pluck('id');
            $oldSold = $product->sold;
            
            if ($variantIds->count() > 0) {
                $newSold = OrderItem::whereIn('variant_id', $variantIds)
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->whereIn('orders.status', ['delivered', 'completed'])
                    ->sum('order_items.quantity');
            } else {
                $newSold = 0;
            }
            
            if ($oldSold != $newSold) {
                $product->sold = (int) $newSold;
                $product->save();
                $updatedCount++;
            }
            
            $totalOldSold += $oldSold;
            $totalNewSold += $newSold;
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        
        $this->info("Update completed!");
        $this->info("Products updated: {$updatedCount}/{$products->count()}");
        $this->info("Total sold count: {$totalOldSold} -> {$totalNewSold}");
    }
}
