import { config as instance } from './axios';

// Định nghĩa kiểu dữ liệu cho payload gửi đi
export interface RefundRequestPayload {
  order_id: number;
  amount: number;
  reason?: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  evidence_image?: string; // Tạm thời là string, sau này có thể là File
}

/**
 * Gửi yêu cầu hoàn tiền lên server
 * @param data Dữ liệu từ form hoàn tiền
 * @returns Promise chứa dữ liệu phản hồi từ server
 */
export const createRefundRequest = async (data: RefundRequestPayload) => {
  const response = await instance.post('/refund-requests', data);
  return response.data;
};
