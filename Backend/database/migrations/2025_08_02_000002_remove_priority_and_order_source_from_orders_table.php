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
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'priority')) {
                $table->dropColumn('priority');
            }
            if (Schema::hasColumn('orders', 'order_source')) {
                $table->dropColumn('order_source');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Re-add columns if rolling back
            if (!Schema::hasColumn('orders', 'priority')) {
                $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            }
            if (!Schema::hasColumn('orders', 'order_source')) {
                $table->string('order_source')->default('website');
            }
        });
    }
}; 