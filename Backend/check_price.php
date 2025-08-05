<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Product;

$product = Product::find(25);
echo "Product ID: " . $product->id . "\n";
echo "Product Name: " . $product->name . "\n";
echo "Product Price: " . $product->price . "\n";

echo "Variants:\n";
foreach($product->variants as $v) {
    echo "- Variant ID: " . $v->id . " | Price: " . $v->price . " | Stock: " . $v->stock . "\n";
}
