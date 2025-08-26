<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Khôi phục mật khẩu - StrideX</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .token {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            word-break: break-all;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔐 Khôi phục mật khẩu</h1>
        <p>StrideX - Cửa hàng thời trang thể thao</p>
    </div>
    
    <div class="content">
        <h2>Xin chào!</h2>
        
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
        
        <p><strong>Email:</strong> {{ $email }}</p>
        
        <h3>🔑 Token khôi phục:</h3>
        <div class="token">{{ $token }}</div>
        
        <p>Hoặc bạn có thể click vào link bên dưới để khôi phục mật khẩu:</p>
        
        <div style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">Khôi phục mật khẩu</a>
        </div>
        
        <p><strong>Lưu ý:</strong></p>
        <ul>
            <li>Token này có hiệu lực trong 60 phút</li>
            <li>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này</li>
            <li>Để bảo mật, vui lòng không chia sẻ token này với bất kỳ ai</li>
        </ul>
        
        <p>Nếu bạn gặp vấn đề, vui lòng liên hệ với chúng tôi qua email: support@stridex.com</p>
    </div>
    
    <div class="footer">
        <p>© 2024 StrideX. Tất cả quyền được bảo lưu.</p>
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
</body>
</html>

