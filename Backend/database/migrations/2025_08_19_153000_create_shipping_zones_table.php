<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('province_name')->unique()->comment('Tên tỉnh/thành phố');
            $table->string('region')->comment('Tên miền: Bắc, Trung, Nam');
            $table->decimal('shipping_fee', 15, 2)->default(30000)->comment('Phí vận chuyển cho miền đó');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_zones');
    }
};
