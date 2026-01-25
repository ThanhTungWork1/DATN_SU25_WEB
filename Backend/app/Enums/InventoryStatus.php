<?php

namespace App\Enums;

class InventoryStatus
{
    const PENDING = 'pending';         // Chờ xác nhận
    const CONFIRMED = 'confirmed';     // Đã xác nhận
    const IMPORTING = 'importing';     // Đang nhập kho
    const IMPORTED = 'imported';       // Đã nhập kho
    const EXPORTING = 'exporting';     // Đang xuất kho
    const EXPORTED = 'exported';       // Đã xuất kho
    const CANCELED = 'canceled';       // Đã huỷ
    const COMPLETED = 'completed';     // Đã hoàn thành

    public static function all()
    {
        return [
            self::PENDING,
            self::CONFIRMED,
            self::IMPORTING,
            self::IMPORTED,
            self::EXPORTING,
            self::EXPORTED,
            self::CANCELED,
            self::COMPLETED,
        ];
    }

    public static function getLabel($status)
    {
        return match ($status) {
            self::PENDING => 'Chờ xác nhận',
            self::CONFIRMED => 'Đã xác nhận',
            self::IMPORTING => 'Đang nhập kho',
            self::IMPORTED => 'Đã nhập kho',
            self::EXPORTING => 'Đang xuất kho',
            self::EXPORTED => 'Đã xuất kho',
            self::CANCELED => 'Đã huỷ',
            self::COMPLETED => 'Đã hoàn thành',
            default => 'Không xác định',
        };
    }
}
