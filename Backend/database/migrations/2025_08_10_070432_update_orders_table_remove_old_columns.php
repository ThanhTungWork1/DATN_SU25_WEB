<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Xoá cột cũ không dùng nữa
            if (Schema::hasColumn('orders', 'sold_number')) {
                $table->dropColumn('sold_number');
            }

            // Chuyển đổi kiểu dữ liệu để đồng bộ
            if (Schema::hasColumn('orders', 'shipping_address')) {
                $table->text('shipping_address')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Khôi phục cột nếu rollback
            if (!Schema::hasColumn('orders', 'sold_number')) {
                $table->decimal('sold_number', 10, 2)->nullable();
            }

            // Khôi phục shipping_address về kiểu cũ
            if (Schema::hasColumn('orders', 'shipping_address')) {
                $table->string('shipping_address', 500)->nullable()->change();
            }
        });
    }
};
