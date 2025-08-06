import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { VoucherResponse } from '../types/Voucher';

export const useVouchers = (page: number) => {
  return useQuery<VoucherResponse, Error>({
    queryKey: ['vouchers', page],
    queryFn: async () => {
      const res = await axios.get<VoucherResponse>(`/api/vouchers?page=${page}`);
      return res.data;
    },
    staleTime: 1000 * 60, // 1 phút
  });
};
