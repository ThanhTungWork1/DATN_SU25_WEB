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
       if (!Schema::hasTable('home_sections')) {
    Schema::create('home_sections', function (Blueprint $table) {
        $table->id();
        $table->string('name', 255);
        $table->string('title', 255);
        $table->text('description')->nullable();
        $table->tinyInteger('status')->default(1);
        $table->timestamps();
    });
}


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_sections');
    }
};
