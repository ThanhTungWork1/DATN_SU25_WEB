<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Update existing values before changing column type
        // Multiply by 100 because the original type was decimal(10, 2)
        DB::table('product_variants')->update(['price' => DB::raw('price * 100')]);

        // Step 2: Change the column type to BIGINT
        Schema::table('product_variants', function (Blueprint $table) {
            $table->bigInteger('price')->unsigned()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            // Change back to decimal
            $table->decimal('price', 10, 2)->change();
        });

        // Divide by 100 to revert to original decimal value
        DB::table('product_variants')->update(['price' => DB::raw('price / 100')]);
    }
};
