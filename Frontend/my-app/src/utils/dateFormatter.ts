/**
 * Format date theo định dạng Việt Nam
 * @param dateString - Chuỗi date từ backend (UTC)
 * @param format - Định dạng hiển thị ('short', 'long', 'time')
 * @returns String đã format
 */
export const formatDate = (dateString: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
    if (!dateString) return '';
    
    try {
        // Tạo date object từ string
        const date = new Date(dateString);
        
        // Kiểm tra date hợp lệ
        if (isNaN(date.getTime())) {
            return 'Ngày không hợp lệ';
        }
        
        // Format theo yêu cầu
        switch (format) {
            case 'short':
                // Format: DD/MM/YYYY
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            
            case 'long':
                // Format: DD/MM/YYYY HH:mm
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            
            case 'time':
                // Format: HH:mm
                return date.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            
            default:
                return date.toLocaleDateString('vi-VN');
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Ngày không hợp lệ';
    }
};

/**
 * Format date cho order (ngày đặt hàng)
 * @param dateString - Chuỗi date từ backend
 * @returns String đã format cho order
 */
export const formatOrderDate = (dateString: string | Date): string => {
    return formatDate(dateString, 'short');
};

/**
 * Format date với timezone Việt Nam
 * @param dateString - Chuỗi date từ backend (đã được set timezone Asia/Ho_Chi_Minh)
 * @returns String đã format theo timezone Việt Nam
 */
export const formatDateVietnam = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Ngày không hợp lệ';
        }
        
        // Backend đã set timezone Asia/Ho_Chi_Minh nên không cần cộng thêm giờ
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date for Vietnam:', error);
        return 'Ngày không hợp lệ';
    }
}; 