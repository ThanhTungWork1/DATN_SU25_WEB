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
          Schema::create('product_variants', function (Blueprint $table) {
              $table->id();
              $table->unsignedBigInteger('product_id'); // Sửa từ integer thành unsignedBigInteger
              $table->unsignedBigInteger('color_id');   // Sửa từ integer thành unsignedBigInteger
              $table->unsignedBigInteger('size_id');    // Sửa từ integer thành unsignedBigInteger
              $table->integer('stock')->default(0);
              $table->decimal('price', 10, 2);
              $table->timestamps();

              $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
              $table->foreign('color_id')->references('id')->on('colors')->onDelete('cascade');
              $table->foreign('size_id')->references('id')->on('sizes')->onDelete('cascade');
          });
      }

      /**
       * Reverse the migrations.
       */
      public function down(): void
      {
          Schema::dropIfExists('product_variants');
      }
  };