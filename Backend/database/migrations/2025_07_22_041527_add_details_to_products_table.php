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
        // SỬA LẠI: Dùng Schema::table() để sửa đổi bảng đã có, thay vì Schema::create()
        Schema::table('products', function (Blueprint $table) {

            // Thêm các cột còn thiếu vào bảng products
            // Code sẽ kiểm tra nếu cột chưa tồn tại thì mới thêm vào
            // Điều này giúp migration chạy được ngay cả khi đã chạy lỗi một nửa trước đó.

            if (!Schema::hasColumn('products', 'slug')) {
                $table->string('slug')->unique()->nullable()->after('name');
            }
            if (!Schema::hasColumn('products', 'old_price')) {
                $table->decimal('old_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'material')) {
                $table->string('material')->nullable()->after('category_id');
            }
            if (!Schema::hasColumn('products', 'discount')) {
                $table->decimal('discount', 10, 2)->nullable()->after('material');
            }
            if (!Schema::hasColumn('products', 'sold')) {
                $table->integer('sold')->default(0)->after('discount');
            }
            if (!Schema::hasColumn('products', 'image')) {
                $table->string('image')->nullable()->after('sold');
            }
            if (!Schema::hasColumn('products', 'hover_image')) {
                $table->string('hover_image')->nullable()->after('image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hàm down() để xóa các cột này nếu bạn muốn hoàn tác migration
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'slug',
                'old_price',
                'material',

                'sold',
                'image',
                'hover_image'
            ]);
        });
    }
};