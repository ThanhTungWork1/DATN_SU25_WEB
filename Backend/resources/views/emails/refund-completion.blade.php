<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoàn tiền thành công</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .order-details {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #28a745;
        }
        .refund-details {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }
        .bill-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
            margin: 10px 0;
        }
        .bill-image-container {
            text-align: center;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Hoàn tiền thành công!</h1>
        <p>Đơn hàng #{{ $order->id }} đã được hoàn tiền</p>
    </div>

    <div class="content">
        <p>Xin chào <strong>{{ $order->customer_name }}</strong>,</p>
        
        <p>Chúng tôi xin thông báo rằng yêu cầu hoàn tiền của bạn đã được xử lý thành công.</p>

        <div class="order-details">
            <h3>📦 Thông tin đơn hàng</h3>
            <p><strong>Mã đơn hàng:</strong> {{ $order->order_code }}</p>
            <p><strong>Ngày đặt hàng:</strong> {{ \Carbon\Carbon::parse($order->created_at)->format('d/m/Y H:i') }}</p>
            <p><strong>Lý do hoàn tiền:</strong> {{ $refundRequest->reason }}</p>
        </div>

        <div class="refund-details">
            <h3>💰 Thông tin hoàn tiền</h3>
            <p class="amount">{{ number_format($refundRequest->amount) }}₫</p>
            <p><strong>Ngân hàng:</strong> {{ $refundRequest->bank_name }}</p>
            <p><strong>Tên chủ tài khoản:</strong> {{ $refundRequest->bank_account_name }}</p>
            <p><strong>Số tài khoản:</strong> {{ $refundRequest->bank_account_number }}</p>
            @if($refundRequest->transaction_code)
                <p><strong>Mã giao dịch:</strong> {{ $refundRequest->transaction_code }}</p>
            @endif
            @if($refundRequest->note_admin)
                <p><strong>Ghi chú:</strong> {{ $refundRequest->note_admin }}</p>
            @endif
            @if($refundRequest->bill_image)
                <p><strong>Ảnh bill chuyển khoản:</strong></p>
                <div class="bill-image-container">
                    <img src="{{ url('storage/' . $refundRequest->bill_image) }}" alt="Ảnh bill chuyển khoản" class="bill-image" />
                </div>
            @endif
        </div>

        <p><strong>⏰ Thời gian hoàn tiền:</strong> {{ \Carbon\Carbon::parse($refundRequest->updated_at)->format('d/m/Y H:i') }}</p>

        <p>Tiền hoàn sẽ được chuyển vào tài khoản ngân hàng của bạn trong vòng 1-3 ngày làm việc.</p>

        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>

        <p>Trân trọng,<br>
        <strong>Đội ngũ StrideX</strong></p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} StrideX. Tất cả quyền được bảo lưu.</p>
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
</body>
</html>
