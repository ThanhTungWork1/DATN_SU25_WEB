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
          Schema::create('notifications', function (Blueprint $table) {
              $table->id();
              $table->unsignedBigInteger('user_id'); // Sửa từ integer thành unsignedBigInteger
              $table->unsignedBigInteger('order_id'); // Sửa từ integer thành unsignedBigInteger
              $table->text('message');
              $table->boolean('is_read')->default(false);
              $table->timestamps();

              $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
              $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
          });
      }

      /**
       * Reverse the migrations.
       */
      public function down(): void
      {
          Schema::dropIfExists('notifications');
      }
  };