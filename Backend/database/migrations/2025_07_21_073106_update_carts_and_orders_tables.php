<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'status')) {
                
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'shipping_phone')) {
                $table->string('shipping_phone', 20)->nullable();
            }
            if (!Schema::hasColumn('orders', 'shipping_name')) {
                $table->string('shipping_name', 255)->nullable();
            }
            if (!Schema::hasColumn('orders', 'note')) {
                $table->string('note', 1000)->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('carts', function (Blueprint $table) {
            if (Schema::hasColumn('carts', 'status')) {
                $table->dropColumn('status');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('orders', 'shipping_phone')) $columns[] = 'shipping_phone';
            if (Schema::hasColumn('orders', 'shipping_name')) $columns[] = 'shipping_name';
            if (Schema::hasColumn('orders', 'note')) $columns[] = 'note';

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
