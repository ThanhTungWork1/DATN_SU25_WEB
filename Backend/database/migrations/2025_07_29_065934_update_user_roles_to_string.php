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
        // Cập nhật role từ số sang string
        DB::table('users')->where('role', '0')->update(['role' => 'user']);
        DB::table('users')->where('role', '1')->update(['role' => 'admin']);
        DB::table('users')->where('role', '2')->update(['role' => 'moderator']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert về số
        DB::table('users')->where('role', 'user')->update(['role' => '0']);
        DB::table('users')->where('role', 'admin')->update(['role' => '1']);
        DB::table('users')->where('role', 'moderator')->update(['role' => '2']);
    }
};
