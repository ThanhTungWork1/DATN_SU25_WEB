<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingZonesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('shipping_zones')->delete();

        $zones = [
            'Bắc' => [
                'fee' => 20000,
                'provinces' => [
                    'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Bắc Giang', 'Hưng Yên', 'Hải Dương',
                    'Thái Bình', 'Nam Định', 'Hà Nam', 'Ninh Bình', 'Vĩnh Phúc', 'Phú Thọ', 'Thái Nguyên',
                    'Tuyên Quang', 'Bắc Kạn', 'Cao Bằng', 'Lạng Sơn', 'Hà Giang', 'Yên Bái', 'Lào Cai',
                    'Lai Châu', 'Điện Biên', 'Sơn La', 'Hòa Bình'
                ]
            ],
            'Trung' => [
                'fee' => 30000,
                'provinces' => [
                    'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế',
                    'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa',
                    'Ninh Thuận', 'Bình Thuận'
                ]
            ],
            'Nam' => [
                'fee' => 40000,
                'provinces' => [
                    'TP. Hồ Chí Minh', 'Bà Rịa – Vũng Tàu', 'Bình Dương', 'Bình Phước', 'Đồng Nai',
                    'Tây Ninh', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp',
                    'An Giang', 'Kiên Giang', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
                ]
            ]
        ];

        foreach ($zones as $region => $data) {
            foreach ($data['provinces'] as $province) {
                DB::table('shipping_zones')->insert([
                    'province_name' => $province,
                    'region' => $region,
                    'shipping_fee' => $data['fee'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
