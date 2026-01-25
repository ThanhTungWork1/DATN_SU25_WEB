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
        if (!Schema::hasTable('home_section_products')) {
            Schema::create('home_section_products', function (Blueprint $table) {
                $table->id();
                $table->foreignId('home_section_id')->constrained('home_sections')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->integer('sort_order')->default(0);
                $table->timestamps();

                $table->unique(['home_section_id', 'product_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_section_products');
    }
};
