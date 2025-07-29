import { useEffect, useState } from "react";
import axios from "../utils/axios";
import type { IProduct } from "../types/Product";

const useProductTop = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<IProduct[]>("/product");

        if (Array.isArray(res.data)) {
          const top5 = res.data.slice(0, 5);
          setProducts(top5);
        } else {
          console.warn("❌ Dữ liệu không hợp lệ:", res.data);
          setProducts([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi fetch sản phẩm:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { products, loading };
};

export default useProductTop;
