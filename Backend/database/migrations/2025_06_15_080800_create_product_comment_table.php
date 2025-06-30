<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_comment', function (Blueprint $table) {
            $table->id(); // Tương đương bigIncrements
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('user_id'); // Bổ sung cột user_id

            $table->enum('vote_start', ['1', '2', '3', '4', '5'])->default('5');
            $table->string('comment');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_comment');
    }
};
