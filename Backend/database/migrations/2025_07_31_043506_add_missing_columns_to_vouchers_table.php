<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            // Kiểm tra và thêm các cột còn thiếu
            if (!Schema::hasColumn('vouchers', 'usage_limit')) {
                $table->integer('usage_limit')->default(1)->after('quantity');
            }

            if (!Schema::hasColumn('vouchers', 'used_count')) {
                $table->integer('used_count')->default(0)->after('usage_limit');
            }

            if (!Schema::hasColumn('vouchers', 'user_type')) {
                $table->enum('user_type', ['all', 'new', 'existing'])->default('all')->after('used_count');
            }

            if (!Schema::hasColumn('vouchers', 'product_categories')) {
                $table->json('product_categories')->nullable()->after('user_type');
            }

            if (!Schema::hasColumn('vouchers', 'excluded_products')) {
                $table->json('excluded_products')->nullable()->after('product_categories');
            }

            if (!Schema::hasColumn('vouchers', 'discount_type')) {
                $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage')->after('excluded_products');
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
                'usage_limit',
                'used_count',
                'user_type',
                'product_categories',
                'excluded_products',
                'discount_type'
            ]);
        });
    }
};
