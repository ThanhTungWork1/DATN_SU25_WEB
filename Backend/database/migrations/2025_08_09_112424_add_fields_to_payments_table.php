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
        Schema::table('payments', function (Blueprint $table) {
            // Thêm các cột bị thiếu nếu chưa tồn tại
            if (!Schema::hasColumn('payments', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('method');
            }
            if (!Schema::hasColumn('payments', 'gateway_response')) {
                // Dùng JSON để lưu phản hồi từ cổng thanh toán
                $table->json('gateway_response')->nullable()->after('bank_code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'gateway_response')) {
                $table->dropColumn('gateway_response');
            }
            if (Schema::hasColumn('payments', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });
    }
};
