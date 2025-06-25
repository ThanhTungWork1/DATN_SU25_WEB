<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('comments')->insert([
            ['product_id' => 1, 'user_id' => 1, 'content' => 'Great product!', 'rating' => 5, 'status' => true, 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => 2, 'user_id' => 2, 'content' => 'Good quality', 'rating' => 4, 'status' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}