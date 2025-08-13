import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRefundRequest, RefundRequestPayload } from '../api/refund';

export const useRefunds = () => {
  const queryClient = useQueryClient();

  const { mutate, ...rest } = useMutation({
    mutationFn: (data: RefundRequestPayload) => createRefundRequest(data),

    onSuccess: () => {
      // Sau khi thành công, buộc làm mới tất cả các query liên quan đến 'orders'
      // refetchQueries sẽ lấy dữ liệu mới ngay lập tức thay vì chỉ đánh dấu là stale.
      queryClient.refetchQueries({ queryKey: ['orders'], exact: false });
    },
  });

  return { createRefund: mutate, ...rest };
};
