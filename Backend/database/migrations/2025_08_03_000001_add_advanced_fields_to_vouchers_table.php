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
        Schema::table('vouchers', function (Blueprint $table) {
            // Thêm ngày bắt đầu sử dụng
            if (!Schema::hasColumn('vouchers', 'start_date')) {
                $table->timestamp('start_date')->nullable()->after('expiry_date');
            }
            
            // Thêm giá trị đơn hàng tối thiểu
            if (!Schema::hasColumn('vouchers', 'min_order_amount')) {
                $table->decimal('min_order_amount', 10, 2)->default(0)->after('start_date');
            }
            
            // Thêm số lần sử dụng tối đa
            if (!Schema::hasColumn('vouchers', 'max_usage')) {
                $table->integer('max_usage')->default(1)->after('min_order_amount');
            }
            
            // Thêm số lần đã sử dụng
            if (!Schema::hasColumn('vouchers', 'used_count')) {
                $table->integer('used_count')->default(0)->after('max_usage');
            }
            
            // Thêm loại giảm giá (fixed = tiền, percent = phần trăm)
            if (!Schema::hasColumn('vouchers', 'discount_type')) {
                $table->enum('discount_type', ['fixed', 'percent'])->default('fixed')->after('used_count');
            }
            
            // Thêm mô tả voucher
            if (!Schema::hasColumn('vouchers', 'description')) {
                $table->text('description')->nullable()->after('discount_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropColumn([
                'start_date',
                'min_order_amount', 
                'max_usage',
                'used_count',
                'discount_type',
                'description'
            ]);
        });
    }
}; 