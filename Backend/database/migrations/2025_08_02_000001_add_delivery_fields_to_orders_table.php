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
        Schema::table('orders', function (Blueprint $table) {
            // Thêm các trường liên quan đến giao hàng
            if (!Schema::hasColumn('orders', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('orders', 'shipping_date')) {
                $table->timestamp('shipping_date')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('orders', 'estimated_delivery_date')) {
                $table->timestamp('estimated_delivery_date')->nullable()->after('shipping_date');
            }
            if (!Schema::hasColumn('orders', 'tracking_number')) {
                $table->string('tracking_number')->nullable()->after('estimated_delivery_date');
            }
            if (!Schema::hasColumn('orders', 'shipping_company')) {
                $table->string('shipping_company')->nullable()->after('tracking_number');
            }
            if (!Schema::hasColumn('orders', 'order_source')) {
                $table->string('order_source')->default('website')->after('shipping_company');
            }
            if (!Schema::hasColumn('orders', 'priority')) {
                $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('order_source');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivered_at',
                'shipping_date',
                'estimated_delivery_date',
                'tracking_number',
                'shipping_company',
                'order_source',
                'priority'
            ]);
        });
    }
}; 