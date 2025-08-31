<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function handle(Request $request)
    {
        $message = $request->input('message');

        if (!$message) {
            return response()->json([
                'reply' => 'Vui lòng nhập nội dung câu hỏi.'
            ], 400);
        }

        $reply = $this->generateReply($message);

        return response()->json([
            'success' => true,
            'reply' => $reply
        ]);
    }

    private function generateReply($message)
    {
        $message = strtolower($message);

        // Voucher / Giảm giá
        if (str_contains($message, 'giảm giá') || str_contains($message, 'voucher')) {
            return 'Shop hiện đang có nhiều chương trình giảm giá hấp dẫn. Bạn vui lòng kiểm tra mục Ưu đãi để biết thêm chi tiết.';
        }

        // Giao hàng
        if (str_contains($message, 'giao hàng') || str_contains($message, 'ship')) {
            return 'Shop giao hàng toàn quốc. Miền Bắc 2–3 ngày, miền Trung 3–4 ngày, miền Nam 5–7 ngày.';
        }

        // Kiểm hàng
        if (str_contains($message, 'kiểm hàng')) {
            return 'Bạn được kiểm tra hàng trước khi thanh toán nhé.';
        }

        // Đổi / Trả hàng
        if (str_contains($message, 'đổi') || str_contains($message, 'trả') || str_contains($message, 'hoàn hàng')) {
            return 'Shop hỗ trợ đổi/trả hàng trong vòng 7 ngày nếu có lỗi từ sản phẩm.';
        }

        // Size
        if (str_contains($message, 'size') || str_contains($message, 'cỡ')) {
            return 'Sản phẩm hiện có 6 size từ S đến 3XL. Bạn vui lòng chọn size phù hợp với chiều cao và cân nặng.';
        }

        // Màu sắc
        if (str_contains($message, 'màu')) {
            return 'Sản phẩm có sẵn 6 màu khác nhau để bạn lựa chọn.';
        }

        // Chất liệu
        if (str_contains($message, 'chất liệu') || str_contains($message, 'vải')) {
            return 'Shop cung cấp 4 loại chất liệu: cotton, thun lạnh, thun co giãn và thể thao chuyên dụng.';
        }

        // Thanh toán
        if (str_contains($message, 'thanh toán') || str_contains($message, 'trả tiền')) {
            return 'Bạn có thể thanh toán khi nhận hàng (COD) hoặc thanh toán online qua ví điện tử / ngân hàng.';
        }

        // Tài khoản / Đăng ký
        if (str_contains($message, 'tài khoản') || str_contains($message, 'đăng ký')) {
            return 'Bạn không cần tài khoản vẫn có thể đặt hàng trên website của chúng tôi.';
        }

        // Liên hệ
        if (str_contains($message, 'liên hệ') || str_contains($message, 'hỗ trợ')) {
            return 'Bạn có thể liên hệ với shop qua Zalo, Facebook Messenger hoặc Email. Thông tin chi tiết có trong phần Liên hệ.';
        }

        // Giờ làm việc
        if (str_contains($message, 'giờ mở cửa') || str_contains($message, 'mấy giờ làm việc') || str_contains($message, 'làm việc lúc nào')) {
            return 'Shop hoạt động từ 8h sáng đến 10h tối mỗi ngày, kể cả cuối tuần.';
        }

        // Sản phẩm bán chạy
        if (str_contains($message, 'bán chạy') || str_contains($message, 'sản phẩm hot') || str_contains($message, 'được mua nhiều')) {
            return 'Các sản phẩm đồ chạy bộ và đồ đá banh là những mặt hàng bán chạy nhất hiện nay.';
        }

        // Theo trend / Thời trang giới trẻ
        if (str_contains($message, 'theo trend') || str_contains($message, 'giới trẻ') || str_contains($message, 'hot trend')) {
            return 'Shop có nhiều mẫu theo trend phù hợp với giới trẻ, bạn có thể xem trong mục "Mới ra mắt" hoặc "Bán chạy".';
        }

        // Cách sử dụng voucher
        if (str_contains($message, 'dùng voucher') || str_contains($message, 'sử dụng mã giảm giá') || str_contains($message, 'áp dụng voucher')) {
            return 'Bạn chỉ cần nhập mã giảm giá ở bước thanh toán, hệ thống sẽ tự động áp dụng nếu hợp lệ.';
        }

        // Có cần đăng nhập không
        if (str_contains($message, 'cần đăng nhập') || str_contains($message, 'phải đăng nhập')) {
            return 'Không cần đăng nhập, bạn vẫn có thể đặt hàng nhanh chóng và dễ dàng.';
        }

        // Chào hỏi / Tạm biệt
        if (str_contains($message, 'lô') || str_contains($message, '...') || str_contains($message, 'shop ơi') || str_contains($message, 'ê') || str_contains($message, 'alo') || str_contains($message, 'chào') || str_contains($message, 'hello') || str_contains($message, 'hi') || str_contains($message, 'tạm biệt') || str_contains($message, 'bye')) {
            return 'Chào bạn! Shop có thể hỗ trợ gì cho bạn hôm nay?';
        }

        // Đổi trả + Ship (trường hợp người dùng hỏi cả 2)
        if ((str_contains($message, 'đổi') || str_contains($message, 'trả') || str_contains($message, 'hoàn hàng')) &&
            (str_contains($message, 'ship') || str_contains($message, 'giao hàng'))) {
            return 'Shop hỗ trợ đổi/trả hàng trong vòng 7 ngày và giao hàng toàn quốc. Miền Bắc 2–3 ngày, miền Trung 3–4 ngày, miền Nam 5–7 ngày.';
        }

        // Giao hàng thời gian cụ thể
        if (str_contains($message, 'miền bắc 1-2 ngày') || str_contains($message, 'miền trung 2-3 ngày') || str_contains($message, 'miền nam 4-5 ngày')) {
            return 'Hiện tại shop đang đẩy nhanh tiến độ giao hàng. Tùy khu vực bạn có thể nhận hàng nhanh hơn dự kiến. Vui lòng để lại địa chỉ cụ thể để shop kiểm tra chính xác.';
        }

        // Hỏi shop có cửa hàng không / bán online
        if (str_contains($message, 'shop ở đâu') || str_contains($message, 'địa chỉ shop') || str_contains($message, 'mua trực tiếp') || str_contains($message, 'có cửa hàng không')) {
            return 'Hiện tại shop chỉ bán hàng online. Bạn có thể đặt hàng trực tiếp qua website và sẽ được giao tận nơi.';
        }

        // Ship hàng nước ngoài
        if (str_contains($message, 'nước ngoài') || str_contains($message, 'quốc tế') || str_contains($message, 'ship quốc tế')) {
            return 'Hiện tại shop **chỉ giao hàng trong nước**, chưa hỗ trợ ship hàng ra nước ngoài ạ.';
        }

        // Hỏi còn hàng
        if (str_contains($message, 'còn hàng') || str_contains($message, 'có hàng không')) {
            return 'Bạn muốn hỏi về sản phẩm nào ạ? Vui lòng truy cập trang sản phẩm cụ thể để xem tình trạng còn hàng theo màu, size và chất liệu.';
        }

        // Mặc định
        return 'Xin lỗi, hiện tại shop chưa thể trả lời câu hỏi này. Bạn vui lòng để lại lời nhắn hoặc liên hệ với chúng tôi qua Zalo, Messenger, Facebook.';
    }

    private function generateKeywordVariations($words)
    {
        $variations = [];

        foreach ($words as $word) {
            $variations[] = $word;

            // Thêm các biến thể phổ biến
            switch ($word) {
                case 'giảm':
                case 'giảm giá':
                    $variations = array_merge($variations, ['voucher', 'mã giảm', 'khuyến mãi', 'sale', 'discount']);
                    break;
                case 'giao':
                case 'ship':
                case 'giao hàng':
                    $variations = array_merge($variations, ['vận chuyển', 'delivery', 'shipping', 'nhận hàng']);
                    break;
                case 'đổi':
                case 'trả':
                    $variations = array_merge($variations, ['hoàn', 'return', 'exchange', 'đổi trả']);
                    break;
                case 'size':
                case 'cỡ':
                    $variations = array_merge($variations, ['số', 'kích thước', 'vừa', 'fit']);
                    break;
                case 'màu':
                    $variations = array_merge($variations, ['color', 'sắc', 'tông']);
                    break;
                case 'giá':
                case 'tiền':
                    $variations = array_merge($variations, ['bao nhiêu', 'cost', 'price', 'đắt', 'rẻ']);
                    break;
                case 'chất':
                case 'liệu':
                    $variations = array_merge($variations, ['vải', 'material', 'cotton', 'thun']);
                    break;
                case 'thanh':
                case 'toán':
                    $variations = array_merge($variations, ['trả tiền', 'payment', 'cod', 'online']);
                    break;
                case 'chào':
                case 'hi':
                case 'hello':
                    $variations = array_merge($variations, ['xin chào', 'lô', 'alo', 'ê', 'shop ơi']);
                    break;
            }
        }

        return array_unique($variations);
    }

    private function containsAny($message, $keywords)
    {
        foreach ($keywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }
        return false;
    }

    private function getSmartFallback($message, $keywords)
    {
        // Nếu message quá ngắn hoặc chỉ có 1-2 từ
        if (strlen($message) < 5 || count($keywords) <= 2) {
            $shortReplies = [
                'Bạn có thể nói rõ hơn về vấn đề cần hỗ trợ không? Shop sẵn sàng tư vấn! 😊',
                'Bạn cần hỗ trợ gì cụ thể không? Shop có thể tư vấn về sản phẩm, giá cả, giao hàng...',
                'Bạn muốn hỏi về sản phẩm, giá cả, giao hàng hay đổi trả? Shop sẽ tư vấn chi tiết!'
            ];
            return $shortReplies[array_rand($shortReplies)];
        }

        // Nếu có từ khóa liên quan đến sản phẩm
        if ($this->containsAny($message, ['sản phẩm', 'hàng', 'đồ', 'quần', 'áo', 'giày'])) {
            $productReplies = [
                'Bạn có thể vào trang sản phẩm để xem chi tiết và đặt hàng nhé! Shop có nhiều sản phẩm chất lượng.',
                'Shop có đa dạng sản phẩm thể thao. Bạn check trang sản phẩm để xem chi tiết và đặt hàng!',
                'Bạn vào trang sản phẩm để xem thông tin chi tiết và đặt hàng nhé! Shop giao hàng toàn quốc.'
            ];
            return $productReplies[array_rand($productReplies)];
        }

        // Fallback thông minh
        $fallbackReplies = [
            'Xin lỗi, shop chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về: sản phẩm, giá cả, giao hàng, đổi trả, thanh toán... Hoặc liên hệ shop qua Zalo, Facebook Messenger để được tư vấn chi tiết! 📞',
            'Shop có thể hỗ trợ bạn về: sản phẩm, giá cả, giao hàng, đổi trả, thanh toán. Bạn hỏi cụ thể hơn hoặc liên hệ shop qua Zalo, Facebook Messenger nhé!',
            'Bạn có thể hỏi shop về: sản phẩm, giá cả, giao hàng, đổi trả, thanh toán. Hoặc liên hệ trực tiếp qua Zalo, Facebook Messenger để được tư vấn tốt nhất!'
        ];

        return $fallbackReplies[array_rand($fallbackReplies)];
    }
}
