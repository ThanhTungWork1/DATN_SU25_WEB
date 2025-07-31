<?php

namespace App\Enums;

class OrderStatus
{
    const PENDING     = 'pending';      // Chờ xác nhận
    const CONFIRMED   = 'confirmed';    // Đã xác nhận
    const PROCESSING  = 'processing';   // Đang xử lý
    const SHIPPING    = 'shipping';     // Đang giao hàng
    const DELIVERED   = 'delivered';    // Đã giao hàng
    const CANCELED    = 'canceled';     // Đã huỷ
    const COMPLETED   = 'completed';    // Đã hoàn thành

    public static function all()
    {
        return [
            self::PENDING,
            self::CONFIRMED,
            self::PROCESSING,
            self::SHIPPING,
            self::DELIVERED,
            self::CANCELED,
            self::COMPLETED,
        ];
    }

    // Lấy tên tiếng Việt cho từng trạng thái
    public static function getLabel($status)
    {
        return match ($status) {
            self::PENDING     => 'Chờ xác nhận',
            self::CONFIRMED   => 'Đã xác nhận',
            self::PROCESSING  => 'Đang xử lý',
            self::SHIPPING    => 'Đang giao hàng',
            self::DELIVERED   => 'Đã giao hàng',
            self::CANCELED    => 'Đã huỷ',
            self::COMPLETED   => 'Đã hoàn thành',
            default           => 'Không xác định',
        };
    }
}
