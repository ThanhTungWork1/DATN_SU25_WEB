<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ProductVariant;

class OrderService
{
    public function __construct(
        protected Order $model
    ) {}

    public function handle()
    {
        return Order::with('items.variant.product')->get();
    }

    /**
     * Update order status and handle inventory
     */
    public function updateOrderStatus($orderId, $newStatus, $oldStatus = null)
    {
        $order = Order::find($orderId);
        
        if (!$order) {
            return false;
        }

        // Update order status
        $order->status = $newStatus;
        $order->save();

        // Handle inventory updates
        $this->handleInventoryUpdate($order, $newStatus, $oldStatus);

        return true;
    }

    /**
     * Handle inventory updates based on order status change
     */
    private function handleInventoryUpdate($order, $newStatus, $oldStatus)
    {
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
    }
}
