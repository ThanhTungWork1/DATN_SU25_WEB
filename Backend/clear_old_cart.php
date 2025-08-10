<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Import models
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;

echo "=== CLEAR OLD CART ITEMS ===\n";

// Find user by name
$user = User::where('name', 'hungtrinh')->first();
if (!$user) {
    echo "User 'hungtrinh' not found!\n";
    exit;
}

echo "User found: ID {$user->id} - {$user->name}\n";

// Find user's cart
$cart = Cart::where('user_id', $user->id)->first();
if (!$cart) {
    echo "No cart found for user.\n";
    exit;
}

echo "Cart found: ID {$cart->id}\n";

// Get all cart items
$cartItems = CartItem::where('cart_id', $cart->id)->with(['variant.product'])->get();
echo "Cart items before clearing: {$cartItems->count()}\n";

foreach ($cartItems as $item) {
    $productName = $item->variant->product->name ?? 'Unknown Product';
    echo "  - {$productName} (Variant ID: {$item->variant_id}, Qty: {$item->quantity})\n";
}

// Clear all cart items
$deletedCount = CartItem::where('cart_id', $cart->id)->delete();
echo "\nDeleted {$deletedCount} cart items.\n";

// Verify
$remainingItems = CartItem::where('cart_id', $cart->id)->count();
echo "Remaining cart items: {$remainingItems}\n";

echo "=== CLEAR COMPLETED ===\n";




