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
          Schema::create('comments', function (Blueprint $table) {
              $table->id();
              $table->unsignedBigInteger('product_id'); // Sửa từ integer thành unsignedBigInteger
              $table->unsignedBigInteger('user_id');    // Sửa từ integer thành unsignedBigInteger
              $table->text('content');
              $table->integer('rating');
              $table->boolean('status')->default(true);
              $table->timestamps();

              $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
              $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
          });
      }

      /**
       * Reverse the migrations.
       */
      public function down(): void
      {
          Schema::dropIfExists('comments');
      }
  };