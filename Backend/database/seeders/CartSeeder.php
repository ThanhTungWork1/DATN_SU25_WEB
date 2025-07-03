<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cart;

class CartSeeder extends Seeder
{
    public function run()
    {
        Cart::create(['user_id' => 2]); // Sử dụng user_id từ dữ liệu cũ
    }
}
