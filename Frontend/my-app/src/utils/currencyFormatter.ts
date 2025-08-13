/**
 * Format tiền tệ VND với định dạng đẹp
 * @param amount - Số tiền cần format
 * @param currency - Loại tiền tệ (mặc định: 'VND')
 * @returns String đã format
 */
export const formatCurrency = (amount: number | string, currency: string = 'VND'): string => {
    // Chuyển đổi sang number nếu là string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
        return '0 ₫';
    }
    
    // Số tiền đã ở đơn vị VND, không nhân thêm
    const amountInVND = numAmount;
    
    // Format số với dấu phẩy phân cách hàng nghìn
    const formattedNumber = new Intl.NumberFormat('vi-VN').format(amountInVND);
    
    // Thêm ký hiệu tiền tệ
    switch (currency.toUpperCase()) {
        case 'VND':
        case '₫':
            return `${formattedNumber} ₫`;
        case 'USD':
            return `$${formattedNumber}`;
        case 'EUR':
            return `€${formattedNumber}`;
        default:
            return `${formattedNumber} ${currency}`;
    }
};

/**
 * Format tiền tệ VND ngắn gọn (VD: 1.5K ₫, 2.3M ₫)
 * @param amount - Số tiền cần format
 * @returns String đã format ngắn gọn
 */
export const formatCurrencyShort = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
        return '0 ₫';
    }
    
    if (numAmount >= 1000000) {
        return `${(numAmount / 1000000).toFixed(1)}M ₫`;
    } else if (numAmount >= 1000) {
        return `${(numAmount / 1000).toFixed(1)}K ₫`;
    } else {
        return `${numAmount} ₫`;
    }
};

/**
 * Format tiền tệ VND với màu sắc dựa trên giá trị
 * @param amount - Số tiền cần format
 * @param threshold - Ngưỡng để thay đổi màu (mặc định: 1000000)
 * @returns Object chứa text và style
 */
export const formatCurrencyWithColor = (amount: number | string, threshold: number = 1000000) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formattedText = formatCurrency(numAmount);
    
    // So sánh trực tiếp theo VND
    const amountInVND = numAmount;
    
    let color = '#52c41a'; // Xanh lá (mặc định)
    
    if (amountInVND >= threshold) {
        color = '#1890ff'; // Xanh dương (cao)
    } else if (amountInVND >= threshold / 2) {
        color = '#faad14'; // Vàng cam (trung bình)
    } else if (amountInVND < 100000) {
        color = '#ff4d4f'; // Đỏ (thấp)
    }
    
    return {
        text: formattedText,
        style: { color, fontWeight: 'bold' }
    };
}; 