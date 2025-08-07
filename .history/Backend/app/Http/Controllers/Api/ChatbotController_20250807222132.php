<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $userMessage = mb_strtolower($request->input('message'), 'UTF-8');

        $mockResponses = [
            // 1. Về sản phẩm
            [['chất liệu', 'vải gì'], 'Dạ sản phẩm có 4 loại chất liệu, đều là vải thể thao chuyên dụng: thoáng khí, co giãn nhẹ, thấm hút mồ hôi tốt ạ.'],
            [['co giãn'], 'Dạ có ạ. Vải co giãn nhẹ, phù hợp vận động mạnh như đá bóng, chạy bộ.'],
            [['có sẵn', 'còn hàng'], 'Dạ sản phẩm luôn có sẵn hàng. Khi hết size/màu nào, shop sẽ ghi rõ trên web.'],
            [['bảng size', 'size gì'], 'Dạ có ạ. Bảng size kèm hướng dẫn chọn size theo chiều cao, cân nặng được hiển thị trên từng sản phẩm.'],
            [['cao', 'nặng', 'mặc size'], 'Dạ với chiều cao & cân nặng trên, anh/chị có thể chọn size M hoặc inbox shop để được tư vấn sát nhất nhé.'],
            [['form', 'chuẩn form'], 'Dạ form chuẩn regular, mặc vừa người. Nếu thích rộng rãi có thể chọn tăng 1 size ạ.'],
            [['ra màu'], 'Dạ không ạ. Shop cam kết vải không ra màu, không xù, không bai nhão.'],
            [['giống hình', 'khác hình'], 'Dạ hình ảnh là chụp thật 100% tại shop. Màu sắc có thể lệch nhẹ do ánh sáng/chụp ảnh.'],
            [['mỏng', 'xuyên thấu'], 'Dạ áo không xuyên thấu, không lộ da. Được thiết kế mỏng nhẹ, thoáng mát, phù hợp mặc thể thao.'],
            [['logo'], 'Dạ tùy mẫu ạ. Một số mẫu có logo in/trượt chống bong, một số theo phong cách tối giản.'],
            [['chính hãng', 'tự sản xuất'], 'Dạ shop thiết kế & sản xuất trực tiếp, kiểm soát chất lượng kỹ càng trước khi bán.'],
            [['tập gym', 'chạy bộ', 'đá bóng'], 'Dạ rất phù hợp ạ. Chất vải chuyên dùng cho tập luyện, co giãn tốt, thoát mồ hôi nhanh.'],
            [['rẻ hơn', 'giá tốt hơn'], 'Dạ có một số mẫu giá tốt hơn. Anh/chị có thể lọc theo giá ở trang danh mục sản phẩm nhé.'],
            [['unisex', 'nam', 'nữ'], 'Dạ hầu hết các mẫu là unisex, phù hợp cho cả nam và nữ mặc đều đẹp.'],

            // 2. Màu sắc, size, phân loại
            [['bao nhiêu màu', 'màu gì'], 'Dạ hiện có 6 màu: đen, trắng, xám, xanh navy, đỏ và xanh rêu.'],
            [['chọn màu'], 'Dạ được ạ. Anh/chị chọn màu trực tiếp tại phần đặt hàng.'],
            [['còn size m'], 'Dạ nếu còn hiện trên web là còn hàng ạ. Nếu hết, anh/chị có thể inbox để đặt trước lô sau.'],
            [['size l'], 'Dạ size L dự kiến về lại sau 3–5 ngày. Anh/chị để lại số điện thoại để shop báo khi có hàng nhé.'],
            [['đồng phục'], 'Dạ có ạ. Shop nhận thiết kế đồng phục thể thao theo yêu cầu nhóm/đội/CLB.'],
            [['mua cả bộ', 'combo'], 'Dạ anh/chị chọn 1 áo + 1 quần hoặc bộ sẵn combo trên web. Nếu cần chọn khác size áo/quần, có thể inbox shop hỗ trợ ạ.'],
            [['tay dài'], 'Dạ có một số mẫu tay dài cùng form, cùng chất liệu. Anh/chị vào mục "Áo tay dài" trên website để xem.'],
            [['quần short', 'legging'], 'Dạ có ạ. Shop có quần thể thao các loại, phối hợp cùng áo để tạo bộ đồ năng động.'],

            // 3. Giá, voucher, khuyến mãi
            [['vat', 'bao gồm thuế'], 'Dạ giá niêm yết đã bao gồm thuế, không phát sinh thêm chi phí nào.'],
            [['mã giảm giá', 'voucher', 'đơn đầu tiên'], 'Dạ có ạ. Anh/chị dùng mã WELCOME10 để giảm 10% cho đơn đầu tiên.'],
            [['giảm giá', 'mua nhiều'], 'Dạ đơn từ 500k sẽ được giảm thêm và freeship. Ngoài ra có combo mua 2 tặng 1 tuỳ mẫu.'],
            [['không áp dụng được mã'], 'Dạ anh/chị vui lòng kiểm tra điều kiện áp dụng mã (giá trị tối thiểu, thời gian còn hiệu lực...). Nếu vẫn lỗi, inbox shop để được hỗ trợ.'],
            [['khuyến mãi', 'kéo dài'], 'Dạ tùy chương trình, thường kéo dài 3–7 ngày. Shop sẽ cập nhật trên banner hoặc fanpage.'],
            [['freeship', 'miễn phí vận chuyển'], 'Dạ đơn từ 500.000đ được freeship toàn quốc ạ.'],
            [['mua 1 tặng 1'], 'Dạ chương trình mua 1 tặng 1 đang áp dụng cho một số mẫu nhất định, anh/chị xem tại mục “Khuyến mãi” trên web nhé.'],

            // 4. Vận chuyển – giao hàng
            [['giao hàng bao lâu', 'mất bao lâu'], 'Dạ:\nMiền Bắc: 2–3 ngày\nMiền Trung: 3–4 ngày\nMiền Nam: 5–7 ngày'],
            [['giao hàng toàn quốc'], 'Dạ có ạ. Shop giao toàn quốc qua GHN và GHTK.'],
            [['đơn vị giao hàng'], 'Dạ bên em giao qua GHN và GHTK, tuỳ khu vực để tối ưu tốc độ giao hàng.'],
            [['hẹn giờ giao hàng'], 'Dạ shipper sẽ gọi trước khi giao. Nếu cần giao vào giờ cụ thể, anh/chị ghi chú lúc đặt hàng ạ.'],
            [['kiểm tra hàng'], 'Dạ có ạ. Anh/chị được xem hàng trước khi thanh toán.'],
            [['hàng về chậm', 'bồi thường'], 'Dạ trong trường hợp lỗi do vận chuyển quá lâu, shop sẽ hỗ trợ đổi trả hoặc tặng mã giảm giá cho đơn sau.'],
            [['thay đổi địa chỉ'], 'Dạ nếu đơn chưa giao, anh/chị inbox hoặc gọi hotline càng sớm càng tốt để shop sửa địa chỉ giúp ạ.'],

            // 5. Đơn hàng – đặt hàng
            [['gọi xác nhận'], 'Dạ thường trong vòng 12–24h. Nếu cần gấp, anh/chị có thể inbox fanpage hoặc Zalo nhé.'],
            [['kiểm tra đơn hàng', 'tình trạng đơn hàng'], 'Dạ anh/chị dùng mã đơn (gửi qua email hoặc tin nhắn) để tra cứu trong mục "Đơn hàng" trên website.'],
            [['đổi size trước khi giao'], 'Dạ inbox shop ngay để đổi size trước khi hàng được đóng gói nhé.'],
            [['huỷ đơn'], 'Dạ được ạ, miễn là đơn chưa giao. Anh/chị inbox hoặc gọi hotline để shop hỗ trợ huỷ.'],
            [['thêm sản phẩm vào đơn'], 'Dạ được nếu đơn chưa đóng gói. Anh/chị inbox để shop thêm hàng vào cùng đơn nhé.'],

            // 6. Đổi trả hàng
            [['đổi size'], 'Dạ anh/chị liên hệ shop trong vòng 7 ngày kể từ ngày nhận hàng để được đổi size miễn phí.'],
            [['sản phẩm lỗi', 'đổi trả'], 'Dạ có ạ. Shop đổi mới 100% hoặc hoàn tiền nếu sản phẩm lỗi do sản xuất hoặc vận chuyển.'],
            [['phí đổi hàng'], 'Dạ đổi hàng do lỗi không mất phí. Đổi size vì không vừa, khách hỗ trợ phí ship 2 chiều ạ.'],
            [['đổi hàng trong bao nhiêu ngày'], 'Dạ thời gian đổi trả là 7 ngày kể từ khi nhận hàng.'],
            [['giữ tem', 'giữ nhãn'], 'Dạ cần giữ nguyên tem, nhãn và sản phẩm chưa giặt hoặc sử dụng ạ.'],
            [['hàng giảm giá'], 'Dạ vẫn được đổi nếu sản phẩm còn nguyên tem và trong thời hạn 7 ngày.'],
            [['bảo hành'], 'Dạ sản phẩm không áp dụng bảo hành, nhưng shop sẽ hỗ trợ đổi trả nếu lỗi trong vòng 7 ngày.'],

            // 7. Thanh toán
            [['cod', 'thanh toán khi nhận hàng'], 'Dạ có ạ, hình thức COD – nhận hàng rồi thanh toán luôn được áp dụng.'],
            [['chuyển khoản'], 'Dạ được ạ. Thông tin tài khoản ngân hàng sẽ hiện khi chọn hình thức "Chuyển khoản".'],
            [['momo', 'zalopay', 'ví điện tử'], 'Dạ hiện tại shop ưu tiên chuyển khoản ngân hàng. Ví điện tử sẽ được bổ sung sớm ạ.'],
            [['bảo mật'], 'Dạ hoàn toàn bảo mật. Thông tin không lưu trữ trên hệ thống, mọi giao dịch qua kênh chính thống.'],
            [['hóa đơn đỏ'], 'Dạ có hỗ trợ xuất hóa đơn nếu anh/chị yêu cầu trước lúc thanh toán.'],

            // 8. Tài khoản, hỗ trợ, liên hệ
            [['quên mật khẩu'], 'Dạ anh/chị nhấn vào "Quên mật khẩu" trên trang đăng nhập và làm theo hướng dẫn.'],
            [['đăng ký tài khoản'], 'Dạ không cần tài khoản vẫn mua hàng được ạ.'],
            [['đổi email', 'đổi số điện thoại'], 'Dạ anh/chị inbox shop để được cập nhật thủ công trên hệ thống.'],
            [['zalo', 'facebook', 'tư vấn'], 'Dạ có ạ. Shop tư vấn 24/7 qua Zalo, Facebook Messenger và Email.'],
            [['hotline', 'số điện thoại'], 'Dạ anh/chị vui lòng inbox để nhận số hotline chính xác, hoặc để lại SĐT – nhân viên sẽ gọi lại hỗ trợ ạ.'],

            // 9. Danh mục sản phẩm
            [['áo thun nam'], 'Dạ shop có rất nhiều mẫu áo thun nam với nhiều màu sắc, chất liệu thể thao thoáng mát. Anh/chị vào mục "Áo thun nam" trên website để xem nhé!'],
            [['áo thun nữ'], 'Dạ shop có nhiều mẫu áo thun nữ trẻ trung, năng động. Anh/chị vào mục "Áo thun nữ" để chọn mẫu phù hợp.'],
            [['quần short nam'], 'Dạ shop có đủ loại quần short nam: thể thao, tập gym, mặc nhà... Anh/chị vào mục "Quần short nam" để xem chi tiết.'],
            [['quần short nữ'], 'Dạ shop có nhiều mẫu quần short nữ, phù hợp tập luyện và mặc hàng ngày. Xem tại mục "Quần short nữ" trên web ạ.'],
            [['áo khoác nam'], 'Dạ shop có áo khoác nam chống nắng, chống nước, giữ ấm... Anh/chị vào mục "Áo khoác nam" để xem mẫu mới nhất.'],
            [['áo khoác nữ'], 'Dạ shop có áo khoác nữ nhiều kiểu dáng, chất liệu nhẹ, dễ phối đồ. Xem tại mục "Áo khoác nữ" trên website.'],
            [['quần dài nam'], 'Dạ shop có quần dài nam: jogger, thể thao, mặc đi làm, đi học... Anh/chị vào mục "Quần dài nam" để xem nhé.'],
            [['quần dài nữ'], 'Dạ shop có quần dài nữ: legging, jogger, quần thể thao... Xem tại mục "Quần dài nữ" trên web.'],
            [['áo polo'], 'Dạ shop có áo polo nam nữ, chất liệu thể thao, mặc đi làm, đi chơi đều đẹp. Xem tại mục "Áo polo".'],
            [['áo tanktop'], 'Dạ shop có áo tanktop nam nữ, phù hợp tập gym, chạy bộ, mặc mùa hè. Xem tại mục "Áo tanktop".'],
            [['áo hoodie'], 'Dạ shop có hoodie nam nữ, chất nỉ dày dặn, nhiều màu trẻ trung. Xem tại mục "Áo hoodie".'],
            [['áo sweater'], 'Dạ shop có sweater nam nữ, giữ ấm tốt, kiểu dáng basic dễ phối đồ. Xem tại mục "Áo sweater".'],
            [['quần legging'], 'Dạ shop có quần legging nữ, co giãn tốt, phù hợp tập gym, yoga. Xem tại mục "Quần legging".'],
            [['quần jogger'], 'Dạ shop có quần jogger nam nữ, chất liệu thể thao, mặc đi chơi, tập luyện đều phù hợp.'],
            [['bộ thể thao nam'], 'Dạ shop có nhiều bộ thể thao nam, combo áo + quần giá ưu đãi. Xem tại mục "Bộ thể thao nam".'],
            [['bộ thể thao nữ'], 'Dạ shop có bộ thể thao nữ, nhiều màu sắc, kiểu dáng trẻ trung. Xem tại mục "Bộ thể thao nữ".'],
            [['áo bra thể thao'], 'Dạ shop có áo bra thể thao nữ, nâng đỡ tốt, chất liệu thấm hút mồ hôi. Xem tại mục "Áo bra thể thao".'],
            [['áo tập gym'], 'Dạ shop có áo tập gym nam nữ, co giãn, thoáng khí, nhiều mẫu mã. Xem tại mục "Áo tập gym".'],
            [['quần tập gym'], 'Dạ shop có quần tập gym nam nữ, chất liệu co giãn, bền đẹp. Xem tại mục "Quần tập gym".'],
            [['phụ kiện thể thao', 'túi', 'mũ', 'tất', 'băng đô'], 'Dạ shop có nhiều phụ kiện thể thao: túi, mũ, tất, băng đô... Anh/chị vào mục "Phụ kiện" để xem nhé.'],
            [['giày thể thao nam'], 'Dạ shop có giày thể thao nam, nhiều mẫu mã, size số đầy đủ. Xem tại mục "Giày thể thao nam".'],
            [['giày thể thao nữ'], 'Dạ shop có giày thể thao nữ, kiểu dáng trẻ trung, năng động. Xem tại mục "Giày thể thao nữ".'],
            [['tất thể thao', 'vớ thể thao'], 'Dạ shop có tất/vớ thể thao nam nữ, chất liệu cotton thấm hút tốt. Xem tại mục "Tất thể thao".'],
            [['đồ lót thể thao'], 'Dạ shop có đồ lót thể thao nam nữ, chất liệu co giãn, thoáng khí. Xem tại mục "Đồ lót thể thao".'],

            [['size nào vừa với tôi', 'tôi nên chọn size nào'], 'Dạ anh/chị có thể tham khảo bảng size theo chiều cao, cân nặng ở từng sản phẩm. Nếu vẫn phân vân thì gửi giúp shop thông tin, shop hỗ trợ tư vấn ạ.'],
            [['chất liệu có co giãn không', 'vải có thoáng không'], 'Dạ sản phẩm bên em làm từ chất liệu thể thao: co giãn tốt, thoáng mát, thấm hút mồ hôi. Anh/chị yên tâm mặc vận động nhé.'],
            [['chất vải thế nào'], 'Dạ bên em có 4 loại chất liệu chính: vải lạnh, cotton thể thao, poly mềm, co giãn 4 chiều. Anh/chị chọn loại phù hợp mục đích sử dụng ạ.'],

            [['màu này có khác ảnh không'], 'Dạ màu sắc thực tế có thể chênh lệch nhẹ do ánh sáng chụp. Shop cam kết hàng giống 95–98% so với hình ảnh.'],
            [['có ảnh chụp thật không'], 'Dạ có ạ, hầu hết sản phẩm đều có ảnh thật do shop tự chụp. Anh/chị cần mẫu nào, shop gửi ảnh thật liền nhé.'],
            [['màu nào đẹp nhất'], 'Dạ mỗi màu có cá tính riêng, anh/chị có thể tham khảo ảnh mẫu mặc để chọn màu phù hợp với gu nhé.'],

            [['có cần tài khoản mới đặt được không'], 'Dạ không cần ạ. Anh/chị có thể đặt hàng nhanh chóng mà không cần đăng ký tài khoản.'],
[['có COD không'], 'Dạ shop có hỗ trợ thanh toán khi nhận hàng (COD) toàn quốc, anh/chị nhận hàng rồi mới thanh toán nhé.'],
[['có thanh toán trước không'], 'Dạ có ạ, anh/chị có thể chuyển khoản ngân hàng hoặc dùng ví điện tử nếu muốn thanh toán trước.'],
[['đã đặt rồi sao chưa thấy gọi'], 'Dạ anh/chị vui lòng để ý cuộc gọi trong vòng 1–3h sau khi đặt. Nếu chưa thấy, anh/chị nhắn cho shop để hỗ trợ liền ạ.'],

[['ship mất bao lâu'], 'Dạ tuỳ khu vực: miền Bắc 2–3 ngày, miền Trung 3–4 ngày, miền Nam 5–7 ngày. Shop gửi hàng qua GHN và GHTK ạ.'],
[['có giao ngoại thành không'], 'Dạ có ạ, shop giao toàn quốc, kể cả vùng xa. Anh/chị chỉ cần điền địa chỉ đầy đủ giúp shop.'],
[['có kiểm hàng trước khi thanh toán không'], 'Dạ có ạ. Anh/chị được xem hàng trước khi trả tiền với các đơn COD. Yên tâm nhận hàng nha.'],

[['hàng không vừa có đổi được không'], 'Dạ có ạ, nếu size không vừa, anh/chị liên hệ shop trong vòng 3 ngày để được đổi size miễn phí 1 lần.'],
[['muốn trả hàng thì sao'], 'Dạ nếu sản phẩm lỗi, shop nhận hoàn hàng trong vòng 7 ngày kể từ khi nhận hàng. Anh/chị inbox để được hỗ trợ ạ.'],
[['đổi màu được không'], 'Dạ anh/chị có thể đổi sang màu khác nếu hàng còn trong kho. Shop hỗ trợ nhanh chóng ạ.'],

[['có hàng mới chưa'], 'Dạ mỗi tuần shop đều có mẫu mới, anh/chị theo dõi fanpage/zalo để xem sớm nhất nha.'],
[['mẫu này có hot trend không'], 'Dạ sản phẩm này đang theo xu hướng thể thao giới trẻ hiện nay, rất được ưa chuộng. Anh/chị mua là bắt trend liền đó ạ.'],
[['có mẫu nào giống idol xxx mặc không'], 'Dạ anh/chị cho shop tên mẫu hoặc idol, nếu có hàng tương tự shop sẽ gợi ý ngay.'],

[['chào shop', 'hello shop', 'hi shop'], 'Dạ em chào anh/chị ạ! Shop thể thao xin được hỗ trợ mình. Anh/chị cần tư vấn về sản phẩm hay đơn hàng ạ?'],
[['shop có đó không', 'có ai không'], 'Dạ shop luôn có mặt ạ! Anh/chị cần hỗ trợ gì cứ nhắn em ngay nhé!'],
[['mình muốn hỏi', 'cho mình hỏi chút'], 'Dạ vâng ạ! Anh/chị cứ hỏi thoải mái, shop sẵn sàng hỗ trợ ạ.'],
[['shop online không', 'shop có đang trực không'], 'Dạ shop đang online và sẵn sàng hỗ trợ anh/chị ạ!'],
[['alo', 'có ai ở đó không','lô','ê',''], 'Dạ em chào anh/chị ạ! Em luôn sẵn sàng hỗ trợ mình ạ. Mình cần tư vấn gì ạ?'],

[['cảm ơn shop', 'ok rồi nhé'], 'Dạ vâng ạ, cảm ơn anh/chị đã ghé thăm shop. Có gì cần thêm cứ nhắn em nha!'],
[['mình xem xong rồi', 'thế là được rồi'], 'Dạ em cảm ơn anh/chị ạ! Hẹn gặp lại mình trong đơn tiếp theo ạ.'],
[['tạm biệt', 'bye shop'], 'Dạ vâng ạ, chúc anh/chị một ngày vui vẻ, tràn đầy năng lượng!'],
[['mình out đây', 'mình thoát đây'], 'Dạ cảm ơn anh/chị đã ghé shop. Có gì cần cứ quay lại hỏi em nhé ạ.'],
[['khi nào cần mình sẽ hỏi tiếp'], 'Dạ ok anh/chị! Em luôn ở đây nếu mình cần hỗ trợ thêm ạ.'],

        ];

        $reply = 'Cảm ơn bạn đã liên hệ! Hiện tại shop chúng tôi chưa chưa có hàng hoặc là tạm ngừng bán sản phẩm đó rồi , bạn vui lòng liên hệ shop để được tư vấn cụ thể hơn nhé !';

        foreach ($mockResponses as [$keywords, $response]) {
            foreach ($keywords as $keyword) {
                if (mb_stripos($userMessage, $keyword, 0, 'UTF-8') !== false) {
                    $reply = $response;
                    break 2;
                }
            }
        }

                return response()->json([
                    'success' => true,
            'reply' => $reply
        ]);
    }
} 