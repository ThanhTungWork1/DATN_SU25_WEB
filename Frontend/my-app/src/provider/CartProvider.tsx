import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartItem, CartContextType } from "../types/CartType";
import axios from 'axios';
import { toast } from 'sonner';

// Giả sử bạn vẫn còn file tokenUtils.ts từ các bước trước
// Nếu không, bạn cần tạo lại nó với TokenManager
import { TokenManager } from "../utils/tokenUtils";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [token, setToken] = useState<string | null>(TokenManager.getToken());

    // Hàm xử lý khi token thay đổi
    const handleTokenChange = useCallback(() => {
        const currentToken = TokenManager.getToken();
        setToken(currentToken);
    }, []);

    // Lắng nghe sự kiện thay đổi token
    useEffect(() => {
        handleTokenChange(); // Kiểm tra ngay lúc đầu

        // Lắng nghe sự kiện 'storage' (cho các tab khác)
        window.addEventListener('storage', handleTokenChange);
        // Lắng nghe sự kiện tùy chỉnh 'token-changed' (cho cùng một tab)
        window.addEventListener('token-changed', handleTokenChange);

        return () => {
            window.removeEventListener('storage', handleTokenChange);
            window.removeEventListener('token-changed', handleTokenChange);
        };
    }, [handleTokenChange]);

    const fetchCart = useCallback(async () => {
        if (!token) {
            setCartItems([]);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/cart', {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // DEBUG: Log để xem backend trả về gì
            console.log('=== CART API DEBUG ===');
            console.log('Full response:', response.data);
            console.log('response.data.cartItems:', response.data?.cartItems);
            console.log('response.data.cart_items:', response.data?.cart_items);
            console.log('response.data.cart?.cartItems:', response.data?.cart?.cartItems);
            console.log('response.data.cart?.cart_items:', response.data?.cart?.cart_items);
            
            // Sửa mapping: thử tất cả các đường dẫn có thể
            const rawCartItems = response.data?.cartItems || 
                                response.data?.cart_items ||
                                response.data?.cart?.cartItems ||
                                response.data?.cart?.cart_items ||
                                [];
            
            console.log('Raw cartItems from backend:', rawCartItems);
            
            // Transform data từ nested structure thành flat structure
            const transformedCartItems = rawCartItems.map((item: any) => ({
                id: item.id,
                product_id: item.variant?.product?.id || item.product_id,
                variant_id: item.variant_id,
                name: item.variant?.product?.name || item.name || 'Sản phẩm không tên',
                price: item.price,
                quantity: item.quantity,
                image: item.variant?.product?.image || item.variant?.image_url || item.image,
                color: item.variant?.color?.name || item.color,
                size: item.variant?.size?.name || item.size,
                // Thêm các trường khác nếu cần
                product: item.variant?.product,
                variant: item.variant
            }));
            
            console.log('Transformed cartItems:', transformedCartItems);
            setCartItems(transformedCartItems);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status !== 404) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
            }
            setCartItems([]); // Luôn reset giỏ hàng nếu có lỗi
        }
    }, [token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (item: CartItem) => {
        const currentToken = TokenManager.getToken();
        if (!currentToken) {
            toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            return; // Dừng lại ngay lập tức
        }

        try {
            // **FIX 2: Gửi dữ liệu đúng định dạng mà backend yêu cầu**
            await axios.post('http://localhost:8000/api/cart', {
                cartItems: [{
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price
                }]
            }, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            toast.success("Đã thêm sản phẩm vào giỏ hàng!");
            fetchCart();
        } catch (error) {
            console.error("Lỗi thêm sản phẩm:", error);
            toast.error("Thêm sản phẩm vào giỏ hàng thất bại!");
        }
    };

    const removeFromCart = async (id: number) => {
        const currentToken = TokenManager.getToken();
        if (!currentToken) return;
        try {
            await axios.delete(`http://localhost:8000/api/cart-item/${id}`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
            fetchCart();
        } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
            toast.error("Xóa sản phẩm thất bại!");
        }
    };

    const clearCart = async () => {
        const currentToken = TokenManager.getToken();
        if (!currentToken) return;
        try {
            await axios.delete('http://localhost:8000/api/cart', {
                 headers: { Authorization: `Bearer ${currentToken}` },
            });
            toast.success("Đã xóa toàn bộ giỏ hàng!");
            setCartItems([]);
        } catch (error) {
            console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
            toast.error("Xóa toàn bộ giỏ hàng thất bại!");
        }
    };

    const removeItem = removeFromCart;

    const updateQuantity = async (id: number, quantity: number) => {
        const currentToken = TokenManager.getToken();
        if (!currentToken) return;
        try {
            await axios.put(`http://localhost:8000/api/cart-item/${id}`, {
                quantity
            }, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            toast.success("Đã cập nhật số lượng!");
            fetchCart();
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
            toast.error("Cập nhật số lượng thất bại!");
        }
    };

    const value = { cartItems, addToCart, removeFromCart, removeItem, updateQuantity, clearCart, fetchCart };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};