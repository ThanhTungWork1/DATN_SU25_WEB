<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Phản hồi liên hệ | StrideX</title>
    <style>
      /* Use inline styles in body for better email client support; keep minimal here */
      @media (max-width: 600px) {
        .container { width: 100% !important; padding: 0 16px !important; }
        .card { padding: 16px !important; }
        .btn { display: block !important; width: 100% !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#f4f6f8;color:#1f2937;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6f8;">
      <tr>
        <td align="center">
          <table class="container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;margin:24px auto;">
            <!-- Header -->
            <tr>
              <td style="padding:16px 24px;background:#0ea5a4;color:#ffffff;border-radius:12px 12px 0 0;">
                <table width="100%">
                  <tr>
                    <td style="font-size:16px;font-weight:700;vertical-align:middle;">
                      <a href="{{ url('/') }}" style="text-decoration:none;color:#ffffff;display:inline-block;">
                        StrideX
                      </a>
                    </td>
                    <td align="right" style="font-size:12px;opacity:0.9;vertical-align:middle;">Phản hồi liên hệ</td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Card body -->
            <tr>
              <td style="background:#ffffff;padding:24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <div class="card" style="padding:8px 0;">
                  <p style="margin:0 0 12px 0;font-size:16px;">Xin chào <strong>{{ $contact->name }}</strong>,</p>
                  <p style="margin:0 0 16px 0;line-height:1.6;">Cảm ơn bạn đã liên hệ với StrideX. Chúng tôi đã tiếp nhận và phản hồi nội dung của bạn như sau:</p>

                  <!-- Meta info -->
                  <div style="font-size:12px;color:#6b7280;margin:4px 0 16px 0;">
                    Mã yêu cầu: <strong>#C{{ $contact->id }}</strong>
                    • Thời gian gửi: {{ optional($contact->created_at)->format('d/m/Y H:i') }}
                  </div>

                  <!-- Reply message -->
                  <div style="border-left:4px solid #0ea5a4;background:#f0fdfa;padding:12px 16px;border-radius:6px;margin:8px 0 20px 0;">
                    <div style="font-weight:700;margin-bottom:6px;">Nội dung phản hồi</div>
                    <div style="white-space:pre-wrap;color:#0f172a;">{{ $replyMessage }}</div>
                  </div>

                  <!-- Customer info -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;margin:0 0 20px 0;">
                    <tr>
                      <td style="padding:12px 16px;font-weight:700;border-bottom:1px solid #e5e7eb;">Thông tin người liên hệ</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;">
                        <div style="margin:0 0 6px 0;"><strong>Họ và tên:</strong> {{ $contact->name }}</div>
                        <div style="margin:0 0 6px 0;"><strong>Email:</strong> {{ $contact->email }}</div>
                        @if(!empty($contact->phone))
                          <div style="margin:0 0 6px 0;"><strong>Điện thoại:</strong> {{ $contact->phone }}</div>
                        @endif
                        @if(!empty($contact->message))
                          <div style="margin:8px 0 0 0;"><strong>Nội dung đã gửi:</strong></div>
                          <div style="white-space:pre-wrap;color:#374151;margin-top:4px;">{{ $contact->message }}</div>
                        @endif
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 16px 0;">Nếu bạn cần thêm hỗ trợ, vui lòng phản hồi lại email này hoặc liên hệ với chúng tôi qua các kênh bên dưới.</p>

                  <!-- CTA & help -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:12px 0 12px 0;">
                    <tr>
                      <td>
                        <a href="{{ url('/') }}" class="btn" style="display:inline-block;background:#0ea5a4;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:600;">Truy cập StrideX</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:16px 24px;color:#6b7280;font-size:12px;">
                <div style="margin-bottom:6px;">Trân trọng,<br /><strong>StrideX Team</strong></div>
                <div style="margin:6px 0 0 0;">Email này được gửi tự động, vui lòng không trả lời nếu không cần thiết.</div>
                <div style="margin:6px 0 0 0;">Hotline: <a href="tel:0123456789" style="color:#0ea5a4;text-decoration:none;">0123 456 789</a> • Hỗ trợ: <a href="mailto:support@stridex.vn" style="color:#0ea5a4;text-decoration:none;">support@stridex.vn</a></div>
                <div style="margin:2px 0 0 0;">© {{ date('Y') }} StrideX. Mọi quyền được bảo lưu.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
