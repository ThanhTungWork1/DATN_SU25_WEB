<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Hàm up() sẽ được chạy khi bạn thực thi lệnh migrate
        Schema::table('orders', function (Blueprint $table) {
            // Thêm các cột mới vào sau cột 'status' để dễ nhìn
            $table->decimal('discount_amount', 10, 2)->default(0)->after('shipping_fee');
            $table->string('customer_name')->after('status');
            $table->string('customer_email')->after('customer_name');
            $table->string('customer_phone')->after('customer_email');
            $table->text('shipping_address')->after('customer_phone');
            $table->string('payment_method')->default('COD')->after('shipping_address');
            $table->text('notes')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hàm down() để xóa các cột này nếu bạn muốn hoàn tác migration
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'discount_amount',
                'customer_name',
                'customer_email',
                'customer_phone',
                'shipping_address',
                'payment_method',
                'notes'
            ]);
        });
    }
};