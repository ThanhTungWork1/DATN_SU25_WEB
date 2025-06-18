<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id(); // id INT AUTO_INCREMENT PRIMARY KEY
            $table->string('name', 255); // name VARCHAR(255) NOT NULL
            $table->string('slug', 255)->unique(); // slug UNIQUE
            $table->unsignedBigInteger('category_id')->nullable(); // category_id INT NULL
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('discount', 10, 2)->default(0);
            $table->string('image', 255)->nullable();
            $table->tinyInteger('status')->default(1); // 1 = hiển thị, 0 = ẩn
            $table->timestamps(); // => tạo created_at và updated_at tự động

            // Foreign key constraint
            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
}
