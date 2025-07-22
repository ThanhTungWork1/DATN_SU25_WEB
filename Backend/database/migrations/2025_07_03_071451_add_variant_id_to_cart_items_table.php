<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
//    Schema::table('cartitems', function (Blueprint $table) {
//         $table->unsignedBigInteger('variant_id')->after('cart_id');

//         // Nếu bạn có bảng product_variants và muốn liên kết:
//         $table->foreign('variant_id')->references('id')->on('product_variants')->onDelete('cascade');
//     });
}

public function down()
{
//    Schema::table('cartitems', function (Blueprint $table) {
//         $table->dropForeign(['variant_id']);
//         $table->dropColumn('variant_id');
//     });
}

};