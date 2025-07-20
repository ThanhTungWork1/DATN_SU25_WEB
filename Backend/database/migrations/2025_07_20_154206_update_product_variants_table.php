<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {

            // =================================================================
            // SỬA LỖI TẠI ĐÂY
            // Dòng code này đã chạy thành công ở lần trước nên chúng ta sẽ vô hiệu hóa nó
            // để nó không chạy lại và gây lỗi nữa.
            // $table->string('image')->nullable()->after('price');
            // =================================================================

            // Thêm ràng buộc UNIQUE (phần này chưa chạy được ở lần trước)
            $table->unique(['product_id', 'color_id', 'size_id']);
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            // Lệnh để hoàn tác nếu cần
            $table->dropUnique(['product_id', 'color_id', 'size_id']);
            // Chúng ta cũng không cần xóa cột image ở đây nữa
            // $table->dropColumn('image');
        });
    }
};
