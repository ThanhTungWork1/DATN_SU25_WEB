<?php
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Khởi tạo database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => 'localhost',
    'database'  => 'datn_su25_4',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    // Tạo bảng payments
    Capsule::schema()->create('payments', function ($table) {
        $table->id();
        $table->bigInteger('order_id');
        $table->string('method');
        $table->decimal('amount', 15, 2);
        $table->string('status')->default('pending');
        $table->string('transaction_id')->nullable();
        $table->timestamp('paid_at')->nullable();
        $table->text('response_data')->nullable();
        $table->timestamps();
    });
    
    echo "✅ Payments table created successfully!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
