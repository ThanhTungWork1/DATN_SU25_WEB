<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Thêm các cột snapshot vào sau cột 'price'
            $table->string('product_name')->after('price');
            $table->string('variant_color_name')->after('product_name');
            $table->string('variant_size_name')->after('variant_color_name');
            $table->string('variant_sku')->nullable()->after('variant_size_name');
            $table->string('variant_image')->nullable()->after('variant_sku');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'product_name',
                'variant_color_name',
                'variant_size_name',
                'variant_sku',
                'variant_image'
            ]);
        });
    }
};
