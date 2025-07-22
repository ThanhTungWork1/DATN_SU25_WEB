<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->integer('status')->default(1);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_address', 500)->nullable();
            $table->string('shipping_phone', 20)->nullable();
            $table->string('shipping_name', 255)->nullable();
            $table->string('note', 1000)->nullable();
            $table->string('payment_method', 100)->nullable();
            $table->decimal('discount_amount', 10, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_address',
                'shipping_phone',
                'shipping_name',
                'note',
                'payment_method',
                'discount_amount',
            ]);
        });
    }
};
