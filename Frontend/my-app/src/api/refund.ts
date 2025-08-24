import { config as instance } from "./axios";

// Định nghĩa kiểu dữ liệu cho payload gửi đi
export interface RefundRequestPayload {
  order_id: number;
  amount: number;
  reason?: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  evidence_image?: File; // File ảnh minh chứng
}

/**
 * Gửi yêu cầu hoàn tiền lên server
 * @param data Dữ liệu từ form hoàn tiền
 * @returns Promise chứa dữ liệu phản hồi từ server
 */
export const createRefundRequest = async (data: RefundRequestPayload) => {
  try {
    // Tạo FormData để gửi file
    const formData = new FormData();

    // Thêm các trường dữ liệu
    formData.append("order_id", data.order_id.toString());
    formData.append("amount", data.amount.toString());
    if (data.reason) {
      formData.append("reason", data.reason);
    }
    formData.append("bank_account_name", data.bank_account_name);
    formData.append("bank_account_number", data.bank_account_number);
    formData.append("bank_name", data.bank_name);

    // Thêm file ảnh nếu có
    if (data.evidence_image) {
      formData.append("evidence_image", data.evidence_image);
    }

    const response = await instance.post("/refund-requests", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
