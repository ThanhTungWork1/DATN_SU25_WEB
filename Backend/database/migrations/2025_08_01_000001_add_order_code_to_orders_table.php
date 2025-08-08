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
        // Kiểm tra xem cột đã tồn tại chưa
        if (!Schema::hasColumn('orders', 'order_code')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('order_code', 20)->nullable()->after('id');
            });
        } else {
            // Nếu cột đã tồn tại, cập nhật để cho phép NULL
            Schema::table('orders', function (Blueprint $table) {
                $table->string('order_code', 20)->nullable()->change();
            });
        }
        
        // Cập nhật các giá trị rỗng thành NULL
        DB::statement("UPDATE orders SET order_code = NULL WHERE order_code = '' OR order_code = 'null'");
        
        // Thêm unique constraint nếu chưa có
        try {
            Schema::table('orders', function (Blueprint $table) {
                $table->unique('order_code');
            });
        } catch (\Exception $e) {
            // Nếu unique constraint đã tồn tại, bỏ qua
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['order_code']);
            $table->dropColumn('order_code');
        });
    }
}; 