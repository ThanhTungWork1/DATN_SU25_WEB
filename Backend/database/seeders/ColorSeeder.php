<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ColorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('colors')->insert([
            ['name' => 'Red', 'hex_code' => '#FF0000', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Blue', 'hex_code' => '#0000FF', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Green', 'hex_code' => '#00FF00', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}