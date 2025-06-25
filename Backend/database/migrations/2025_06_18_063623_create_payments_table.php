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
          Schema::create('payments', function (Blueprint $table) {
              $table->id();
              $table->unsignedBigInteger('order_id'); // Sửa từ integer thành unsignedBigInteger
              $table->string('method', 50);
              $table->string('status', 50);
              $table->decimal('amount', 10, 2);
              $table->datetime('paid_at')->nullable();
              $table->timestamps();

              $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
          });
      }

      /**
       * Reverse the migrations.
       */
      public function down(): void
      {
          Schema::dropIfExists('payments');
      }
  };