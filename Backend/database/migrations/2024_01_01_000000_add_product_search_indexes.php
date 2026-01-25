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
        Schema::table('products', function (Blueprint $table) {
            // Index cho tìm kiếm cơ bản
            $table->index(['status', 'category_id'], 'idx_products_status_category');
            $table->index('price', 'idx_products_price');
            $table->index('created_at', 'idx_products_created_at');
            
            // Full-text search index cho name và description
            $table->fullText(['name', 'description'], 'idx_products_name_desc_fulltext');
            
            // Index cho material
            $table->index('material', 'idx_products_material');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            // Index cho variants
            $table->index(['product_id', 'color_id'], 'idx_variants_product_color');
            $table->index(['product_id', 'size_id'], 'idx_variants_product_size');
            $table->index('stock', 'idx_variants_stock');
        });

        Schema::table('categories', function (Blueprint $table) {
            // Index cho categories
            $table->index('status', 'idx_categories_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_status_category');
            $table->dropIndex('idx_products_price');
            $table->dropIndex('idx_products_created_at');
            $table->dropIndex('idx_products_name_desc_fulltext');
            $table->dropIndex('idx_products_material');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex('idx_variants_product_color');
            $table->dropIndex('idx_variants_product_size');
            $table->dropIndex('idx_variants_stock');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_status');
        });
    }
};
