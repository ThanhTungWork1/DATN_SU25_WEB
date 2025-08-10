import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../provider/CartProvider";
import { clearAllCarts } from "../../../utils/cartUtils";
import { TokenManager } from "../../../utils/tokenUtils";
import axios from "axios";
import { 
    Card, 
    Button, 
    InputNumber, 
    Checkbox, 
    Typography, 
    Space, 
    Image, 
    Row, 
    Col, 
    Divider,
    Empty,
    message,
    Input,
    Tag,
    Badge,
    Tooltip,
    Spin,
    Alert
} from 'antd';
import { 
    DeleteOutlined, 
    ShoppingCartOutlined, 
    GiftOutlined,
    TagOutlined,
    HeartOutlined,
    EditOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variant_id?: string;
    product_id?: string;
    size?: string;
    color?: string;
    original_price?: number;
    discount_percent?: number;
    brand?: string;
    sku?: string;
    stock?: number;
}

interface CouponData {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
}

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [shippingFee] = useState(30000); // Fixed shipping fee

    useEffect(() => {
        const loadCartData = async () => {
            console.log('🔍 loadCartData called');
            const token = TokenManager.getUserToken();
            console.log('🔍 Token exists:', !!token);
            
            if (token) {
                // Load from backend API if user is logged in
                console.log('🔍 Fetching cart from API...');
                try {
                    const response = await axios.get('http://localhost:8000/api/cart', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    });
                    
                    console.log('Cart API response:', response.data);
                    console.log('🔍 response.data.cart:', response.data.cart);
                    console.log('🔍 response.data.cart?.cartItems:', response.data.cart?.cartItems);
                    console.log('🔍 response.data.cart?.cart_items:', response.data.cart?.cart_items);
                    
                    // Handle different response formats - fix for new backend structure
                    let cartItems = null;
                    if (response.data.cart && response.data.cart !== null) {
                        // Check for cart_items first (what backend actually returns)
                        if (response.data.cart.cart_items) {
                            cartItems = response.data.cart.cart_items;
                            console.log('✅ Using cart.cart_items');
                        } else if (response.data.cart.cartItems) {
                            cartItems = response.data.cart.cartItems;
                            console.log('✅ Using cart.cartItems');
                        }
                    } else if (response.data.cartItems) {
                        cartItems = response.data.cartItems;
                        console.log('✅ Using direct cartItems');
                    } else if (response.data.cart_items) {
                        cartItems = response.data.cart_items;
                        console.log('✅ Using direct cart_items');
                    }
                    
                    console.log('Extracted cartItems:', cartItems);
                    
                    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
                        // Transform backend data to frontend format
                        const backendItems = cartItems.map((item: any) => {
                            // Debug variant image data
                            console.log(`🖼️ Variant ${item.variant_id} image data:`, {
                                variant_image_url: item.variant?.image_url,
                                variant_image: item.variant?.image,
                                product_image_url: item.variant?.product?.image_url,
                                product_image: item.variant?.product?.image,
                                color: item.variant?.color?.name,
                                size: item.variant?.size?.name
                            });

                            return {
                                id: item.id.toString(),
                                name: item.variant?.product?.name || 'Sản phẩm',
                                price: item.price,
                                quantity: item.quantity,
                                // ✅ PRIORITY: variant image > product image > fallback
                                image: item.variant?.image_url || 
                                       item.variant?.image || 
                                       item.variant?.product?.image_url || 
                                       item.variant?.product?.image || 
                                       '/placeholder-image.png',
                                product_id: item.variant?.product?.id?.toString(),
                                variant_id: item.variant_id,
                                size: item.variant?.size?.name || item.variant?.size,
                                color: item.variant?.color?.name || item.variant?.color,
                                original_price: item.variant?.product?.original_price || item.price,
                                brand: item.variant?.product?.brand || 'StrideX',
                                sku: item.variant?.sku || `SKU-${item.variant_id}`,
                                stock: item.variant?.stock || 99,
                            };
                        });
                        console.log('Transformed cart items:', backendItems);
                        setCartItems(backendItems);
                        console.log('Cart state after setCartItems:', backendItems);
                        return;
                    } else {
                        console.log('No cart items found in API response, trying localStorage...');
                    }
                } catch (error) {
                    console.error('Error loading cart from API:', error);
                }
            }
            
            // Fallback: Load from localStorage
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            const localItems = JSON.parse(savedCart);
            console.log('Loading from localStorage:', localItems);
            setCartItems(localItems);
        } else {
            console.log('No cart data in localStorage either');
        }
        };
        
        loadCartData();
    }, []);

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(id);
            return;
        }
        
        const updatedItems = cartItems.map(item => 
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    };

    const removeItem = (id: string) => {
        const updatedItems = cartItems.filter(item => item.id !== id);
        setCartItems(updatedItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        
        // Remove from selected items too
        const newSelected = { ...selectedItems };
        delete newSelected[id];
        setSelectedItems(newSelected);
        
        message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    };

    const clearAllCart = async () => {
        try {
            // Clear both API cart and localStorage cart
            await clearAllCarts();
            setCartItems([]);
            setSelectedItems({});
            message.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
        } catch (error: any) {
            console.error("Lỗi khi xóa giỏ hàng:", error);
            // Still clear local cart even if API fails
            setCartItems([]);
            setSelectedItems({});
            localStorage.removeItem('cartItems');
            message.warning('Đã xóa giỏ hàng local, nhưng có lỗi khi đồng bộ với server');
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleSelectAll = () => {
        const allSelected = cartItems.every(item => selectedItems[item.id]);
        const newSelected: Record<string, boolean> = {};
        
        if (!allSelected) {
            cartItems.forEach(item => {
                newSelected[item.id] = true;
            });
        }
        
        setSelectedItems(newSelected);
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            message.warning('Vui lòng nhập mã giảm giá');
            return;
        }

        setCouponLoading(true);
        try {
            // Mock coupon validation - replace with real API call
            const mockCoupons = [
                { code: 'WELCOME10', discount_type: 'percentage' as const, discount_value: 10, min_order_value: 100000 },
                { code: 'SAVE50K', discount_type: 'fixed' as const, discount_value: 50000, min_order_value: 200000 },
                { code: 'FREESHIP', discount_type: 'fixed' as const, discount_value: 30000, min_order_value: 0 },
            ];

            const coupon = mockCoupons.find(c => c.code === couponCode.toUpperCase());
            
            if (!coupon) {
                message.error('Mã giảm giá không hợp lệ');
                return;
            }

            const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (subtotal < (coupon.min_order_value || 0)) {
                message.error(`Đơn hàng tối thiểu ${(coupon.min_order_value || 0).toLocaleString('vi-VN')} VND`);
                return;
            }

            setAppliedCoupon(coupon);
            message.success('Áp dụng mã giảm giá thành công!');
        } catch (error) {
            message.error('Có lỗi xảy ra khi áp dụng mã giảm giá');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        message.success('Đã hủy mã giảm giá');
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        
        const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (appliedCoupon.discount_type === 'percentage') {
            const discount = (subtotal * appliedCoupon.discount_value) / 100;
            return Math.min(discount, appliedCoupon.max_discount || discount);
        } else {
            return appliedCoupon.discount_value;
        }
    };

    const saveForLater = async (itemId: string) => {
        // Mock save for later functionality
        message.success('Đã lưu sản phẩm để mua sau');
        removeItem(itemId);
    };

    const selectedProducts = cartItems.filter(item => selectedItems[item.id]);
    const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = calculateDiscount();
    const finalShippingFee = subtotal > 500000 ? 0 : shippingFee; // Free ship for orders > 500k
    const totalAmount = subtotal - discount + finalShippingFee;
    const allSelected = cartItems.length > 0 && cartItems.every(item => selectedItems[item.id]);

    const handleCheckout = () => {
        if (selectedProducts.length === 0) {
            message.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }
        
        // Save selected items to localStorage
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
        navigate('/checkout');
    };

    console.log('Current cartItems state:', cartItems, 'Length:', cartItems.length);

    if (cartItems.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Giỏ hàng của bạn đang trống"
                />
                <Button 
                    type="primary" 
                    size="large" 
                    onClick={() => navigate('/')}
                    style={{ marginTop: 16 }}
                >
                    Tiếp tục mua sắm
                </Button>
                <div style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
                    Debug: cartItems.length = {cartItems.length}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                <ShoppingCartOutlined style={{ marginRight: 8 }} />
                Giỏ hàng của bạn
            </Title>

            <Row gutter={24}>
                {/* Cart Items */}
                <Col xs={24} lg={16}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Checkbox 
                                checked={allSelected}
                                onChange={toggleSelectAll}
                            >
                                Chọn tất cả ({cartItems.length} sản phẩm)
                            </Checkbox>
                                <Button 
                                    type="text" 
                                    danger 
                                    onClick={clearAllCart}
                                    disabled={cartItems.length === 0}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>
                        }
                    >
                        {cartItems.map((item) => (
                            <div key={item.id} style={{ 
                                marginBottom: 20, 
                                padding: 16, 
                                border: '1px solid #f0f0f0', 
                                borderRadius: 8,
                                backgroundColor: selectedItems[item.id] ? '#f6ffed' : '#fff'
                            }}>
                                <Row gutter={16}>
                                    <Col flex="none" style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 8 }}>
                                        <Checkbox
                                            checked={selectedItems[item.id] || false}
                                            onChange={() => toggleSelectItem(item.id)}
                                        />
                                    </Col>
                                    
                                    <Col flex="none">
                                        <Badge.Ribbon 
                                            text={item.stock && item.stock < 10 ? `Còn ${item.stock}` : null} 
                                            color="red"
                                        >
                                        <Image
                                                width={120}
                                                height={120}
                                            src={item.image}
                                            alt={item.name}
                                                style={{ 
                                                    objectFit: 'cover', 
                                                    borderRadius: 8,
                                                    border: '1px solid #f0f0f0'
                                                }}
                                                fallback="/placeholder-image.png"
                                            />
                                        </Badge.Ribbon>
                                    </Col>
                                    
                                    <Col flex="auto">
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ flex: 1 }}>
                                                <Text strong style={{ fontSize: 18, color: '#262626' }}>
                                                    {item.name}
                                                </Text>
                                                
                                                <div style={{ marginTop: 8, marginBottom: 12 }}>
                                                    <Space wrap>
                                                        {item.brand && (
                                                            <Tag color="blue">
                                                                <Text style={{ fontSize: 12 }}>{item.brand}</Text>
                                                            </Tag>
                                                        )}
                                                        {item.sku && (
                                                            <Tag color="default">
                                                                <Text style={{ fontSize: 12 }}>SKU: {item.sku}</Text>
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </div>

                                                <div style={{ marginBottom: 12 }}>
                                                    <Space size="large">
                                                        {item.size && (
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: 12 }}>Kích thước:</Text>
                                                                <br />
                                                                <Tag color="geekblue" style={{ marginTop: 4 }}>{item.size}</Tag>
                                                            </div>
                                                        )}
                                                        {item.color && (
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: 12 }}>Màu sắc:</Text>
                                                                <br />
                                                                <Tag color="green" style={{ marginTop: 4 }}>{item.color}</Tag>
                                                            </div>
                                                        )}
                                                    </Space>
                                                </div>

                                                <div style={{ marginBottom: 16 }}>
                                                    <Space direction="vertical" size={4}>
                                                        {item.original_price && item.original_price > item.price && (
                                                            <Text 
                                                                delete 
                                                                type="secondary" 
                                                                style={{ fontSize: 14 }}
                                                            >
                                                                {item.original_price.toLocaleString('vi-VN')} VND
                                                            </Text>
                                                        )}
                                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ff4d4f' }}>
                                                            {item.price.toLocaleString('vi-VN')} VND
                                                        </Text>
                                                        {item.original_price && item.original_price > item.price && (
                                                            <Tag color="red" style={{ fontSize: 12 }}>
                                                                Giảm {Math.round(((item.original_price - item.price) / item.original_price) * 100)}%
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </div>
                                            </div>

                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                borderTop: '1px solid #f0f0f0',
                                                paddingTop: 12,
                                                marginTop: 'auto'
                                            }}>
                                        <Space>
                                                    <Text type="secondary">Số lượng:</Text>
                                            <InputNumber
                                                min={1}
                                                        max={item.stock || 99}
                                                value={item.quantity}
                                                onChange={(value) => updateQuantity(item.id, value || 1)}
                                                style={{ width: 80 }}
                                                        size="small"
                                                    />
                                                    {item.stock && item.stock < 10 && (
                                                        <Tooltip title={`Chỉ còn ${item.stock} sản phẩm`}>
                                                            <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
                                                        </Tooltip>
                                                    )}
                                                </Space>

                                                <Space>
                                                    <Tooltip title="Lưu để mua sau">
                                                        <Button
                                                            type="text"
                                                            icon={<HeartOutlined />}
                                                            onClick={() => saveForLater(item.id)}
                                                            size="small"
                                                        />
                                                    </Tooltip>
                                                    
                                                    <Tooltip title="Xóa khỏi giỏ hàng">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeItem(item.id)}
                                                            size="small"
                                            />
                                                    </Tooltip>
                                        </Space>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                    </Card>
                </Col>

                {/* Order Summary */}
                <Col xs={24} lg={8}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        {/* Coupon Section */}
                        <Card 
                            title={
                                <Space>
                                    <GiftOutlined />
                                    <Text>Mã giảm giá</Text>
                                </Space>
                            }
                            size="small"
                        >
                            {appliedCoupon ? (
                                <div style={{ 
                                    padding: 12, 
                                    backgroundColor: '#f6ffed', 
                                    border: '1px solid #b7eb8f',
                                    borderRadius: 6,
                                    marginBottom: 12
                                }}>
                                    <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                                        <Space>
                                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                            <div>
                                                <Text strong>{appliedCoupon.code}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Giảm {appliedCoupon.discount_type === 'percentage' 
                                                        ? `${appliedCoupon.discount_value}%` 
                                                        : `${appliedCoupon.discount_value.toLocaleString('vi-VN')} VND`}
                                                </Text>
                                            </div>
                                        </Space>
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            danger
                                            onClick={removeCoupon}
                                        >
                                            Hủy
                                        </Button>
                                    </Space>
                            </div>
                            ) : (
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Nhập mã giảm giá"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        onPressEnter={applyCoupon}
                                        prefix={<TagOutlined />}
                                    />
                                    <Button 
                                        type="primary" 
                                        loading={couponLoading}
                                        onClick={applyCoupon}
                                    >
                                        Áp dụng
                                    </Button>
                                </Space.Compact>
                            )}
                            
                            <div style={{ marginTop: 12 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Mã có sẵn: WELCOME10, SAVE50K, FREESHIP
                                </Text>
                            </div>
                        </Card>

                        {/* Order Summary */}
                        <Card 
                            title={
                                <Space>
                                    <ShoppingCartOutlined />
                                    <Text>Tóm tắt đơn hàng</Text>
                                </Space>
                            }
                            style={{ position: 'sticky', top: 20 }}
                        >
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text>Số lượng sản phẩm:</Text>
                                    <Text strong>{selectedProducts.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</Text>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text>Tạm tính:</Text>
                                    <Text>{subtotal.toLocaleString('vi-VN')} VND</Text>
                                </div>

                                {discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <Text>Giảm giá:</Text>
                                        <Text style={{ color: '#52c41a' }}>-{discount.toLocaleString('vi-VN')} VND</Text>
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Space>
                                        <Text>Phí vận chuyển:</Text>
                                        {subtotal > 500000 && (
                                            <Tag color="green" style={{ fontSize: 10 }}>
                                                Miễn phí
                                            </Tag>
                                        )}
                                    </Space>
                                    <Text style={{ color: finalShippingFee === 0 ? '#52c41a' : '#262626' }}>
                                        {finalShippingFee === 0 ? 'Miễn phí' : `${finalShippingFee.toLocaleString('vi-VN')} VND`}
                                    </Text>
                                </div>

                                {subtotal > 0 && subtotal <= 500000 && (
                                    <Alert
                                        message={`Mua thêm ${(500000 - subtotal).toLocaleString('vi-VN')} VND để được miễn phí vận chuyển`}
                                        type="info"
                                        showIcon
                                        style={{ fontSize: 12, marginBottom: 12 }}
                                    />
                                )}
                            
                            <Divider />
                            
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <Text strong style={{ fontSize: 18 }}>Tổng cộng:</Text>
                                    <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                                    {totalAmount.toLocaleString('vi-VN')} VND
                                </Text>
                            </div>

                                {selectedProducts.length > 0 && (
                                    <div style={{ 
                                        backgroundColor: '#fafafa', 
                                        padding: 12, 
                                        borderRadius: 6, 
                                        marginBottom: 16,
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <Text strong style={{ fontSize: 14, color: '#262626' }}>
                                            Đã chọn {selectedProducts.length} sản phẩm:
                                        </Text>
                                        <div style={{ marginTop: 8 }}>
                                            {selectedProducts.map((item) => (
                                                <div key={item.id} style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4
                                                }}>
                                                    <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: item.name }}>
                                                        {item.name} x{item.quantity}
                                                    </Text>
                                                    <Text style={{ fontSize: 12 }}>
                                                        {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                        
                        <Button 
                            type="primary" 
                            size="large" 
                            block
                            onClick={handleCheckout}
                            disabled={selectedProducts.length === 0}
                                style={{ marginBottom: 12 }}
                        >
                                {selectedProducts.length === 0 
                                    ? 'Chọn sản phẩm để thanh toán' 
                                    : `Thanh toán (${selectedProducts.length} sản phẩm)`
                                }
                        </Button>
                        
                        <Button 
                            type="default" 
                            size="large" 
                            block
                            onClick={() => navigate('/')}
                        >
                            Tiếp tục mua sắm
                        </Button>
                    </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;