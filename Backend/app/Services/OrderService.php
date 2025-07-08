<?php

namespace App\Services;

use App\Models\Order;

class OrderService
{
    public function __construct(
        protected Order $model
    ) {}
    public function handle()
    {
        return Order::with('items.variant.product')->get();
    }
}
