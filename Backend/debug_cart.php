<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Import models
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;

echo "=== CART DEBUG ===\n";

// Find user by name
$user = User::where('name', 'hungtrinh')->first();
if (!$user) {
    echo "User 'hungtrinh' not found!\n";
    exit;
}

echo "User found: ID {$user->id} - {$user->name} - {$user->email}\n\n";

// Check all carts for this user
$carts = Cart::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
echo "Total carts for user: " . $carts->count() . "\n";

foreach ($carts as $index => $cart) {
    echo "Cart #{$cart->id} (created: {$cart->created_at}):\n";
    
    $cartItems = CartItem::where('cart_id', $cart->id)
        ->with(['variant.product', 'variant.color', 'variant.size'])
        ->get();
    
    foreach ($cartItems as $item) {
        $productName = $item->variant->product->name ?? 'Unknown Product';
        $colorName = $item->variant->color->name ?? 'Unknown Color';
        $sizeName = $item->variant->size->name ?? 'Unknown Size';
        
        echo "  - Item ID: {$item->id}, Variant ID: {$item->variant_id}, Qty: {$item->quantity}\n";
        echo "    Product: {$productName} ({$colorName}, {$sizeName})\n";
    }
    echo "\n";
}

echo "=== END DEBUG ===\n";




