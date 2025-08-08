<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phản hồi từ StrideX</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
        }
        .content-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
        }
        .reply-title {
            font-weight: bold;
            color: #007bff;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .reply-content {
            font-size: 15px;
            line-height: 1.8;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .signature {
            margin-top: 20px;
            font-weight: bold;
            color: #007bff;
        }
        .contact-info {
            margin-top: 15px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">StrideX</div>
            <div class="subtitle">Fashion & Lifestyle Store</div>
        </div>
        
        <div class="greeting">
            Xin chào <strong>{{ $contact->name }}</strong>,
        </div>
        
        <p>Cảm ơn bạn đã liên hệ với StrideX! Chúng tôi đã nhận được tin nhắn của bạn và rất vui được phản hồi.</p>
        
        <div class="content-box">
            <div class="reply-title">📝 Phản hồi từ đội ngũ StrideX:</div>
            <div class="reply-content">{{ $replyMessage }}</div>
        </div>
        
        <p>Nếu bạn có thêm bất kỳ thắc mắc nào, đừng ngần ngại liên hệ lại với chúng tôi. Đội ngũ StrideX luôn sẵn sàng hỗ trợ bạn!</p>
        
        <div class="footer">
            <div class="signature">Trân trọng,<br>Đội ngũ hỗ trợ khách hàng StrideX</div>
            
            <div class="contact-info">
                📧 Email: support@stridex.com | 📞 Hotline: 1900-STRIDEX<br>
                🌐 Website: www.stridex.com | 📍 Địa chỉ: Hà Nội, Việt Nam<br><br>
                <em>Email này được gửi tự động, vui lòng không reply trực tiếp.</em>
            </div>
        </div>
    </div>
</body>
</html>