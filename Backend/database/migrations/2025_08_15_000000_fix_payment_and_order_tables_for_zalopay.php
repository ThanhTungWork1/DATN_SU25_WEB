<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sửa bảng payments
        Schema::table('payments', function (Blueprint $table) {
            // Thêm các cột còn thiếu
            if (!Schema::hasColumn('payments', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->after('amount');
            }
            if (!Schema::hasColumn('payments', 'bank_code')) {
                $table->string('bank_code')->nullable()->after('transaction_id');
            }
            if (!Schema::hasColumn('payments', 'payment_method')) {
                $table->string('payment_method', 50)->nullable()->after('bank_code');
            }
            if (!Schema::hasColumn('payments', 'gateway_response')) {
                $table->text('gateway_response')->nullable()->after('payment_method');
            }
        });

        // Sửa bảng orders
        Schema::table('orders', function (Blueprint $table) {
            // Thêm các cột còn thiếu
            if (!Schema::hasColumn('orders', 'shipping_address')) {
                $table->text('shipping_address')->nullable()->after('priority');
            }
            if (!Schema::hasColumn('orders', 'shipping_phone')) {
                $table->string('shipping_phone')->nullable()->after('shipping_address');
            }
            if (!Schema::hasColumn('orders', 'shipping_name')) {
                $table->string('shipping_name')->nullable()->after('shipping_phone');
            }
            if (!Schema::hasColumn('orders', 'note')) {
                $table->text('note')->nullable()->after('shipping_name');
            }
            if (!Schema::hasColumn('orders', 'payment_method')) {
                $table->string('payment_method', 50)->nullable()->after('note');
            }
            if (!Schema::hasColumn('orders', 'discount_amount')) {
                $table->decimal('discount_amount', 10, 2)->nullable()->default(0.00)->after('payment_method');
            }
        });
    }

    public function down(): void
    {
        // Xóa các cột đã thêm
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['transaction_id', 'bank_code', 'payment_method', 'gateway_response']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_address', 'shipping_phone', 'shipping_name', 'note', 'payment_method', 'discount_amount']);
        });
    }
}; 