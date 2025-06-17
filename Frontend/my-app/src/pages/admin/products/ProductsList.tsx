import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../../api/product";
import { useNavigate } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const res = await getProducts();
    setProducts(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    fetchData();
  };

  return (
    <div>
      <h2>Danh sách sản phẩm</h2>
      <button onClick={() => navigate("/admin/products/create")}>Thêm mới</button>
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price} VND</td>
              <td>
                <button onClick={() => navigate(`/admin/products/edit/${p.id}`)}>Sửa</button>
                <button onClick={() => handleDelete(p.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
