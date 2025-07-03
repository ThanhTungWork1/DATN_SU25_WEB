<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            ColorSeeder::class,
            SizeSeeder::class,
            UserSeeder::class,
            ProductSeeder::class,
            ProductVariantSeeder::class,
            OrderSeeder::class,
            OrderItemSeeder::class,
            PaymentSeeder::class,
            VoucherSeeder::class,
            ComplaintSeeder::class,
            CommentSeeder::class,
            NotificationSeeder::class,
            CartSeeder::class,
            CartItemSeeder::class,
            BannerSeeder::class,
            ProductVariantSeeder::class,
        ]);
    }
}