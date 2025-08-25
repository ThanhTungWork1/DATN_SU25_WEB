<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventoryService
{
    /**
     * Get inventory statistics
     */
    public function getInventoryStats()
    {
        $totalProducts = Product::count();
        
        $lowStockProducts = ProductVariant::where('stock', '<', 10)
            ->where('stock', '>', 0)
            ->distinct('product_id')
            ->count('product_id');
            
        $outOfStockProducts = ProductVariant::where('stock', '<=', 0)
            ->distinct('product_id')
            ->count('product_id');
            
        $totalValueResult = ProductVariant::join('products', 'product_variants.product_id', '=', 'products.id')
            ->selectRaw('SUM(product_variants.stock * products.price) as total_value')
            ->first();
        $totalValue = $totalValueResult ? $totalValueResult->total_value : 0;

        return [
            'total_products' => $totalProducts,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'total_value' => $totalValue, // Total value in VND
        ];
    }

    /**
     * Get inventory list with pagination and search
     */
    public function getInventoryList($search = '', $page = 1, $perPage = 10)
    {
        $query = Product::with(['variants.color', 'variants.size', 'category'])
            ->select('products.*')
            ->join('product_variants', 'products.id', '=', 'product_variants.product_id')
            ->groupBy('products.id')
            ->selectRaw('
                products.*,
                SUM(product_variants.stock) as total_available_stock,
                MIN(product_variants.stock) as min_available_stock,
                COUNT(product_variants.id) as total_variants
            ');

        if ($search) {
            $query->where('products.name', 'like', "%{$search}%")
                  ->orWhere('products.sku', 'like', "%{$search}%");
        }

        $total = $query->count();
        
        $products = $query->orderBy('min_available_stock', 'asc')
                         ->offset(($page - 1) * $perPage)
                         ->limit($perPage)
                         ->get();

        // Format data for frontend
        $formattedProducts = $products->map(function ($product) {
            $variants = $product->variants->map(function ($variant) {
                return [
                    'id' => $variant->id,
                    'size_name' => $variant->size->name ?? 'N/A',
                    'color_name' => $variant->color->name ?? 'N/A',
                    'stock' => $variant->stock,
                    'stock_reserved' => $variant->stock_reserved,
                    'stock_available' => $variant->stock_available,
                    'price' => ($product->price ?? 0), // Price in VND
                ];
            });

            $status = $this->getProductStatus($product->min_available_stock);

            return [
                'id' => $product->id,
                'name' => $product->name,
                'image' => $product->image_url ?? 'https://via.placeholder.com/60x60',
                'category' => $product->category->name ?? 'N/A',
                'price' => ($product->price ?? 0), // Price in VND
                'variants' => $variants,
                'total_stock' => $product->total_available_stock,
                'min_stock' => $product->min_available_stock,
                'status' => $status,
            ];
        });

        return [
            'data' => $formattedProducts,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ];
    }

    /**
     * Get product status based on stock
     */
    private function getProductStatus($minStock)
    {
        if ($minStock <= 0) {
            return 'out_of_stock';
        } elseif ($minStock < 10) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }

    /**
     * Update stock when order status changes
     */
    public function updateStockForOrder($orderId, $newStatus, $oldStatus = null)
    {
        $order = Order::with('items.variant')->find($orderId);
        
        if (!$order) {
            return false;
        }

        foreach ($order->items as $item) {
            $variant = $item->variant;
            
            if (!$variant) {
                continue;
            }

            $quantity = $item->quantity;

            switch ($newStatus) {
                case 'confirmed':
                    // Reserve stock when order is confirmed
                    $variant->reserveStock($quantity);
                    break;
                    
                case 'cancelled':
                    // Release reserved stock when order is cancelled
                    if ($oldStatus === 'confirmed') {
                        $variant->releaseStock($quantity);
                    }
                    break;
                    
                case 'delivered':
                case 'completed':
                    // Deduct stock when order is delivered/completed
                    if ($oldStatus === 'confirmed') {
                        $variant->deductStock($quantity);
                    }
                    break;
                    
                case 'returned':
                    // Add back stock when order is returned
                    $variant->stock += $quantity;
                    $variant->updateStockAvailable();
                    break;
            }
        }

        return true;
    }

    /**
     * Get low stock alerts
     */
    public function getLowStockAlerts($limit = 5)
    {
        $lowStockProducts = Product::with(['variants.color', 'variants.size'])
            ->select('products.*')
            ->join('product_variants', 'products.id', '=', 'product_variants.product_id')
            ->where('product_variants.stock', '<', 10)
            ->groupBy('products.id')
            ->selectRaw('
                products.*,
                MIN(product_variants.stock) as min_stock,
                COUNT(product_variants.id) as total_low_stock_variants
            ')
            ->orderBy('min_stock', 'asc')
            ->limit($limit)
            ->get();

        $totalLowStock = ProductVariant::where('stock', '<', 10)
            ->where('stock', '>', 0)
            ->distinct('product_id')
            ->count('product_id');
            
        $outOfStock = ProductVariant::where('stock', '<=', 0)
            ->distinct('product_id')
            ->count('product_id');

        $formattedProducts = $lowStockProducts->map(function ($product) {
            $lowStockVariants = $product->variants
                ->where('stock', '<', 10)
                ->map(function ($variant) use ($product) {
                    return [
                        'size_name' => $variant->size->name ?? 'N/A',
                        'color_name' => $variant->color->name ?? 'N/A',
                        'stock' => $variant->stock,
                        'price' => ($product->price ?? 0), // Price in VND
                    ];
                })
                ->toArray();

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'low_stock_variants' => $lowStockVariants,
                'total_low_stock_variants' => $product->total_low_stock_variants,
                'min_stock' => $product->min_stock,
            ];
        });

        return [
            'total_low_stock' => $totalLowStock,
            'out_of_stock' => $outOfStock,
            'low_stock_products' => $formattedProducts,
        ];
    }
} 