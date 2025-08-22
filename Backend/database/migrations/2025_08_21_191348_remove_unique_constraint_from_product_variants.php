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
        Schema::table('product_variants', function (Blueprint $table) {
            // Xóa unique constraint cho product_id + color_id + size_id
            // Cho phép cùng màu có nhiều size khác nhau
            $table->dropUnique(['product_id', 'color_id', 'size_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            // Thêm lại unique constraint nếu cần rollback
            $table->unique(['product_id', 'color_id', 'size_id']);
        });
    }
};
