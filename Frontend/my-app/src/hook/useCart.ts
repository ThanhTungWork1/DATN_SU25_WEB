// import { useState, useEffect } from "react";
// import axios from "axios";
// import type { CartItem, CartResponse } from "../types/CartType";
// import { TokenManager } from "../utils/tokenUtils";

// export default function useCart(token: string) {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   const fetchCart = async () => {
//     try {
//       const currentToken = TokenManager.getUserToken();

//       if (!currentToken) {
//         console.warn("⚠️ No token found, setting empty cart");
//         setCartItems([]);
//         return;
//       }

//       const res = await axios.get<CartResponse>("http://localhost:8000/api/cart", {
//         headers: {
//           Authorization: `Bearer ${currentToken}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       });

//       setCartItems(res.data.cart_items || []);
//     } catch (error: any) {
//       console.error("❌ Lỗi fetch cart:", error);
//       console.error("❌ Error details:", error.response?.data);
//       if (error.response?.status === 404) {
//         setCartItems([]);
//       } else {
//         // Fallback: set empty cart
//         setCartItems([]);
//       }
//     }
//   };

//   const updateQuantity = async (id: number, quantity: number) => {
//     try {
//       await axios.put(
//         `http://localhost:8000/api/cart/${id}`,
//         { quantity },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       fetchCart();
//     } catch (error: any) {}
//   };

//   const removeItem = async (id: number) => {
//     try {
//       await axios.delete(`http://localhost:8000/api/cart/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       fetchCart();
//     } catch (error: any) {}
//   };

//   const clearCart = async () => {
//     try {
//       await axios.post(
//         "http://localhost:8000/api/cart-clear",
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setCartItems([]);
//     } catch (error: any) {}
//   };

//   const addToCart = async (item: any) => {
//     try {
//       const currentToken = TokenManager.getUserToken();

//       if (!currentToken) {
//         throw new Error("No authentication token found");
//       }

//       // Gửi variant_id nếu có; fallback product_id
//       const requestData = {
//         cartItems: [
//           {
//             variant_id: item.variant_id,
//             product_id: item.product_id,
//             quantity: item.quantity || 1,
//             price: item.price || 0,
//           },
//         ],
//       } as any;

//       const response = await axios.post(
//         "http://localhost:8000/api/cart",
//         requestData,
//         {
//           headers: {
//             Authorization: `Bearer ${currentToken}`,
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//         }
//       );

//       fetchCart(); // Refresh cart
//     } catch (error: any) {
//       throw error; // Throw error để ProductActions có thể bắt
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   return {
//     cartItems,
//     fetchCart,
//     addToCart,
//     updateQuantity,
//     removeItem,
//     clearCart,
//   };
// }

import { useState, useEffect } from "react";
import axios from "axios";
import type { CartItem, CartResponse } from "../types/CartType";
import { TokenManager } from "../utils/tokenUtils";

export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const currentToken = TokenManager.getUserToken();

      if (!currentToken) {
        console.warn("⚠️ No token found, setting empty cart");
        setCartItems([]);
        return;
      }

      const res = await axios.get<CartResponse>(
        "http://localhost:8000/api/cart",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      setCartItems(res.data.cart_items || []);
    } catch (error: any) {
      console.error("❌ Lỗi fetch cart:", error);
      console.error("❌ Error details:", error.response?.data);
      if (error.response?.status === 404) {
        setCartItems([]);
      } else {
        // Fallback: set empty cart
        setCartItems([]);
      }
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      await axios.put(
        `http://localhost:8000/api/cart/${id}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchCart();
    } catch (error: any) {}
  };

  const removeItem = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCart();
    } catch (error: any) {}
  };

  const clearCart = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/cart-clear",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCartItems([]);
    } catch (error: any) {}
  };

  const addToCart = async (item: any) => {
    try {
      const currentToken = TokenManager.getUserToken();

      if (!currentToken) {
        throw new Error("No authentication token found");
      }

      // Gửi variant_id nếu có; fallback product_id
      const requestData = {
        cartItems: [
          {
            variant_id: item.variant_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price || 0,
          },
        ],
      } as any;

      const response = await axios.post(
        "http://localhost:8000/api/cart",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      fetchCart(); // Refresh cart
    } catch (error: any) {
      throw error; // Throw error để ProductActions có thể bắt
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cartItems,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
