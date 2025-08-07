import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../provider/CartProvider";
import { 
    Card, 
    Button, 
    InputNumber, 
    Checkbox, 
    Image, 
    Divider, 
    Alert, 
    Empty,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Input,
    message
} from "antd";
import { 
    ArrowLeftOutlined, 
    DeleteOutlined, 
    MinusOutlined, 
    PlusOutlined,
    ShoppingCartOutlined,
    GiftOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeItem, clearCart, fetchCart } = useCart();

    const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});
    const { register, handleSubmit, setValue } = useForm();
    
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Tự động chọn tất cả sản phẩm khi load trang
    useEffect(() => {
        const allSelected = cartItems.reduce((acc, item) => {
            acc[item.id] = true;
            return acc;
        }, {} as { [key: number]: boolean });
        setSelectedItems(allSelected);
    }, [cartItems]);

    const toggleSelectItem = (id: number) => {
        setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const onSubmit = (data: any) => {
        Object.keys(data).forEach((key) => {
            const id = Number(key.replace("qty-", ""));
            const quantity = Number(data[key]);
            if (quantity > 0) updateQuantity(id, quantity);
        });
        message.success("Đã cập nhật giỏ hàng!");
    };

    const selectedProducts = cartItems.filter((item) => selectedItems[item.id]);
    const totalAmount = selectedProducts.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        if (newQuantity > 0) {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleRemoveItem = (itemId: number) => {
        removeItem(itemId);
        message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    };

    const handleClearCart = () => {
        clearCart();
        message.success("Đã xóa toàn bộ giỏ hàng!");
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Header Banner */}
            <Alert
                message="Miễn phí vận chuyển với cho hóa đơn từ 500.000 VND trở lên trên toàn quốc"
                type="info"
                showIcon
                style={{ 
                    textAlign: 'center',
                    borderRadius: 0,
                    border: 'none'
                }}
            />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
                    <ShoppingCartOutlined style={{ marginRight: 8 }} />
                    Giỏ hàng của bạn
                </Title>

            {cartItems.length === 0 ? (
                    <Card>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Giỏ hàng trống"
                        >
                            <Button 
                                type="primary" 
                                size="large"
                                onClick={() => navigate("/")}
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </Empty>
                    </Card>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                        <Row gutter={24}>
                            {/* Sản phẩm */}
                            <Col xs={24} lg={16}>
                                <Card 
                                    title="SẢN PHẨM" 
                                    style={{ marginBottom: 16 }}
                                    bodyStyle={{ padding: 0 }}
                                >
                            {cartItems.map((item) => (
                                        <div key={item.id}>
                                            <div style={{ 
                                                padding: 24, 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                gap: 16
                                            }}>
                                                <Checkbox
                                        checked={selectedItems[item.id] || false}
                                        onChange={() => toggleSelectItem(item.id)}
                                    />
                                                
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    style={{ 
                                                        objectFit: 'cover',
                                                        borderRadius: 8
                                                    }}
                                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                                
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Title level={5} style={{ margin: 0 }}>
                                                        {item.name}
                                                    </Title>
                                                    {item.color && item.size && (
                                                        <Space>
                                                            <Tag color="blue">{item.color.toUpperCase()}</Tag>
                                                            <Tag color="green">{item.size.toUpperCase()}</Tag>
                                                        </Space>
                                                    )}
                                                </div>
                                                
                                                <div style={{ textAlign: 'right' }}>
                                                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                                                        {item.price.toLocaleString('vi-VN')} VND
                                                    </Text>
                                                    
                                                    <Space>
                                                        <Button
                                                            icon={<MinusOutlined />}
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        />
                                                        <InputNumber
                                                            min={1}
                                                            value={item.quantity}
                                                            style={{ width: 80 }}
                                                            onChange={(value) => {
                                                                if (value && value > 0) {
                                                                    handleQuantityChange(item.id, value);
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            icon={<PlusOutlined />}
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        />
                                                    </Space>
                                                    
                                                    <Text strong style={{ fontSize: 16, display: 'block', marginTop: 8 }}>
                                                        {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                                                    </Text>
                                                </div>
                                                
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    title="Xóa sản phẩm"
                                                />
                                            </div>
                                            <Divider style={{ margin: 0 }} />
                                        </div>
                                    ))}
                                    
                                    <div style={{ 
                                        padding: 24, 
                                        backgroundColor: '#fafafa',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Button 
                                            icon={<ArrowLeftOutlined />}
                                            onClick={() => navigate("/")}
                                        >
                                            ← TIẾP TỤC XEM SẢN PHẨM
                                        </Button>
                                        
                                        <Button 
                                            type="primary"
                                            htmlType="submit"
                                        >
                                            CẬP NHẬT GIỎ HÀNG
                                        </Button>
                                    </div>
                                </Card>
                            </Col>

                            {/* Tóm tắt đơn hàng */}
                            <Col xs={24} lg={8}>
                                <Card title="CỘNG GIỎ HÀNG">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Tạm tính:</Text>
                                            <Text strong>{totalAmount.toLocaleString('vi-VN')} VND</Text>
                                </div>
                                        
                                        <Divider />
                                        
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Nhập địa chỉ của bạn để xem các tùy chọn vận chuyển
                                            </Text>
                                            <Button type="link" size="small" style={{ padding: 0 }}>
                                                Tính phí giao hàng
                                            </Button>
                        </div>

                                        <Divider />
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text strong style={{ fontSize: 16 }}>Tổng:</Text>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {totalAmount.toLocaleString('vi-VN')} VND
                                            </Text>
                                        </div>
                                        
                                        <Button
                                            type="primary"
                                            size="large"
                                            danger
                                            style={{ width: '100%', height: 48 }}
                                    onClick={() =>
                                        navigate("/checkout", {
                                            state: { selectedProducts, totalAmount },
                                        })
                                    }
                                    disabled={selectedProducts.length === 0}
                                >
                                            TIẾN HÀNH THANH TOÁN
                                        </Button>
                                        
                                        {/* Phiếu ưu đãi */}
                                        <Card 
                                            size="small" 
                                            title={
                                                <Space>
                                                    <GiftOutlined />
                                                    <span>Phiếu ưu đãi</span>
                                                </Space>
                                            }
                                            style={{ marginTop: 16 }}
                                        >
                                            <Space.Compact style={{ width: '100%' }}>
                                                <Input placeholder="Mã ưu đãi" />
                                                <Button>Áp dụng</Button>
                                            </Space.Compact>
                                        </Card>
                                        
                                        <Button
                                            danger
                                            style={{ width: '100%' }}
                                            onClick={handleClearCart}
                                    disabled={cartItems.length === 0}
                                >
                                            XÓA TOÀN BỘ GIỎ HÀNG
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                </form>
            )}
            </div>
        </div>
    );
};

export default CartPage;