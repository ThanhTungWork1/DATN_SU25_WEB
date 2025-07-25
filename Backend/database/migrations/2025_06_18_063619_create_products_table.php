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
          Schema::create('products', function (Blueprint $table) {
              $table->id();
              $table->unsignedBigInteger('category_id'); // Sửa từ integer thành unsignedBigInteger
              $table->string('name', 255);
              $table->text('description');
              $table->decimal('price', 10, 2);
              $table->boolean('status')->default(true);
              $table->timestamps();

              $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
          });
      }

      /**
       * Reverse the migrations.
       */
      public function down(): void
      {
          Schema::dropIfExists('products');
      }
  };