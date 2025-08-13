import React from "react";
import { UseOrder } from "../../../types/UseOrder";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRefunds } from '../../../hook/useRefunds';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type RefundType = "cancel" | "return";

// Validation Schema
const refundSchema = z.object({
  reason: z.string().min(1, 'Vui lòng chọn lý do'),
  bank_name: z.string().min(1, 'Vui lòng chọn ngân hàng'),
  bank_account_name: z.string().min(1, 'Tên chủ tài khoản là bắt buộc'),
  bank_account_number: z.string().min(1, 'Số tài khoản là bắt buộc'),
  // evidence_images: z.any().optional(), // Tạm thời bỏ qua validation ảnh
});

type RefundFormData = z.infer<typeof refundSchema>;

interface Props {
  order: UseOrder;
  refundType: RefundType;
  onClose: () => void;
}

const RefundRequestModal: React.FC<Props> = ({ order, refundType, onClose }) => {
  const { createRefund, isPending: isLoading } = useRefunds(); // Rename to match v5
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    mode: 'onChange', // Validate on change to enable/disable button
  });

  const onSubmit = (data: RefundFormData) => {
    if (!order) return;

        const payload = {
      ...data,
      order_id: order.id,
      amount: Number(order.total_price || 0),
    };

    createRefund(payload, {
      onSuccess: () => {
        toast.success('Yêu cầu hoàn tiền đã được gửi thành công!');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        reset();
        onClose();
      },
      onError: (error: any) => {
        if (error.response && error.response.status === 409) {
          toast.error('Đơn hàng này đã có yêu cầu hoàn tiền trước đó.');
        } else {
          const errorMessage = error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
          toast.error(errorMessage);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {refundType === "cancel"
              ? "Yêu cầu hoàn tiền khi hủy đơn"
              : "Yêu cầu trả hàng / hoàn tiền"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Thông tin đơn hàng */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Thông tin đơn hàng</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Mã đơn:</span> #{order.id}
              </p>
              <p>
                <span className="font-medium">Tổng tiền:</span>{" "}
                {Number(order.total_price || 0).toLocaleString("vi-VN")}đ
              </p>
              <p>
                <span className="font-medium">Trạng thái:</span> {order.status}
              </p>
            </div>
          </div>

          {/* Lý do */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do {refundType === "cancel" ? "hủy đơn" : "trả hàng"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register('reason')}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
            >
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
              <option value="">Chọn lý do...</option>
              {refundType === "cancel" ? (
                <>
                  <option value="changed_mind">Đổi ý không muốn mua nữa</option>
                  <option value="found_better_price">
                    Tìm được giá tốt hơn
                  </option>
                  <option value="wrong_order">Đặt nhầm sản phẩm</option>
                  <option value="other">Lý do khác</option>
                </>
              ) : (
                <>
                  <option value="defective">Sản phẩm bị lỗi/hỏng</option>
                  <option value="wrong_item">Giao sai sản phẩm</option>
                  <option value="not_as_described">Không đúng mô tả</option>
                  <option value="quality_issue">Chất lượng không tốt</option>
                  <option value="other">Lý do khác</option>
                </>
              )}
            </select>
          </div>

          {/* Thông tin ngân hàng */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Thông tin tài khoản nhận hoàn tiền
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên chủ tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('bank_account_name')}
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.bank_account_name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ví dụ: NGUYEN VAN A"
              />
              {errors.bank_account_name && <p className="text-red-500 text-sm mt-1">{errors.bank_account_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('bank_account_number')}
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.bank_account_number ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nhập số tài khoản"
              />
              {errors.bank_account_number && <p className="text-red-500 text-sm mt-1">{errors.bank_account_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                {...register('bank_name')}
                className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.bank_name ? 'border-red-500' : 'border-gray-300'}`}
              >
                {errors.bank_name && <p className="text-red-500 text-sm mt-1">{errors.bank_name.message}</p>}
                <option value="">Chọn ngân hàng...</option>
                <option value="Vietcombank">Vietcombank</option>
                <option value="VietinBank">VietinBank</option>
                <option value="BIDV">BIDV</option>
                <option value="Agribank">Agribank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="MBBank">MB Bank</option>
                <option value="VPBank">VPBank</option>
                <option value="TPBank">TPBank</option>
                <option value="SHB">SHB</option>
                <option value="ACB">ACB</option>
                <option value="Sacombank">Sacombank</option>
                <option value="HDBank">HDBank</option>
                <option value="VIB">VIB</option>
                <option value="Eximbank">Eximbank</option>
                <option value="NamABank">Nam A Bank</option>
                <option value="OceanBank">OceanBank</option>
                <option value="PGBank">PG Bank</option>
                <option value="SeABank">SeABank</option>
                <option value="BacABank">Bac A Bank</option>
                <option value="KienLongBank">KienlongBank</option>
                <option value="LienVietPostBank">LienVietPostBank</option>
                <option value="VietCapitalBank">Viet Capital Bank</option>
                <option value="BaoVietBank">BaoViet Bank</option>
                <option value="NCB">NCB (Ngân hàng Quốc dân)</option>
                <option value="SaigonBank">SaigonBank</option>
                <option value="SCB">SCB (Ngân hàng Sài Gòn)</option>
                <option value="HSBC">HSBC</option>
                <option value="StandardChartered">Standard Chartered</option>
                <option value="ANZ">ANZ</option>
                <option value="HongLeongBank">Hong Leong Bank</option>
                <option value="ShinhanBank">Shinhan Bank</option>
                <option value="UOB">UOB</option>
                <option value="PublicBank">Public Bank</option>
                <option value="CIMB">CIMB</option>
                <option value="WooriBank">Woori Bank</option>
                <option value="KookminBank">Kookmin Bank</option>
                <option value="Maybank">Maybank</option>
                <option value="Timo">Timo</option>
                <option value="TNEX">TNEX</option>
                <option value="Cake">Cake by VPBank</option>
                <option value="Ubank">Ubank by VPBank</option>
                <option value="OctoFast">OctoFast by CIMB</option>
                <option value="ViettelMoney">Viettel Money</option>
              </select>
            </div>
          </div>

          {/* Số tiền hoàn */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Số tiền sẽ được hoàn:
              </span>
              <span className="text-xl font-bold text-blue-600">
                {Number(order.total_price || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Thời gian xử lý: 3-5 ngày làm việc sau khi được duyệt
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
                       <button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundRequestModal;
