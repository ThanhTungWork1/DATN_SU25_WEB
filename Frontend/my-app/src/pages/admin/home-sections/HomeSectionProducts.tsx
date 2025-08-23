import React from 'react';
import "../../../assets/styles/admin-responsive.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { ApiHomeSection } from "../../../api/ApiHomeSection";
import { getAllProducts } from "../../../api/ApiProduct";
import { HomeSection, Product } from "../../../types/HomeSection";
import { formatCurrency } from "../../../utils/currencyFormatter";
import "../../../layouts/Admin/HomeSectionProducts.css";

const HomeSectionProducts = () => {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<HomeSection | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // State cho chức năng thay thế sản phẩm
  const [replacingProductId, setReplacingProductId] = useState<number | null>(
    null
  );
  const [newProductId, setNewProductId] = useState<number | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [replaceSearchTerm, setReplaceSearchTerm] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchSectionData();
      fetchAllProducts();
    }
  }, [id]);

  const fetchSectionData = async () => {
    try {
      const response = await ApiHomeSection.getSectionProducts(parseInt(id!));
      // Tạo section object từ response
      const sectionData: HomeSection = {
        id: parseInt(id!),
        name: response.section,
        title: response.section,
        description: "",
        status: true,
        created_at: "",
        updated_at: "",
        products: response.products || [],
      };
      setSection(sectionData);
    } catch (err) {
      setError("Không thể tải dữ liệu section");
      console.error("Error fetching section:", err);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await getAllProducts();
      setAllProducts(response || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    try {
      await ApiHomeSection.addProductsToSection(
        parseInt(id!),
        selectedProducts
      );
      setSelectedProducts([]);
      fetchSectionData();
      toast.success("Đã thêm sản phẩm vào section thành công!");
    } catch (err) {
      console.error("Error adding products:", err);
      toast.error("Có lỗi xảy ra khi thêm sản phẩm");
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    try {
      await ApiHomeSection.removeProductFromSection(parseInt(id!), productId);
      fetchSectionData();
      toast.success("Đã xóa sản phẩm khỏi section thành công!");
    } catch (err) {
      console.error("Error removing product:", err);
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  const handleReplaceProduct = async () => {
    if (!replacingProductId || !newProductId) {
      toast.error("Vui lòng chọn sản phẩm mới");
      return;
    }

    try {
      // Xóa sản phẩm cũ
      await ApiHomeSection.removeProductFromSection(
        parseInt(id!),
        replacingProductId
      );
      // Thêm sản phẩm mới
      await ApiHomeSection.addProductsToSection(parseInt(id!), [newProductId]);

      // Reset state
      setReplacingProductId(null);
      setNewProductId(null);
      setShowReplaceModal(false);

      // Refresh data
      fetchSectionData();
      toast.success("Đã thay thế sản phẩm thành công!");
    } catch (err) {
      console.error("Error replacing product:", err);
      toast.error("Có lỗi xảy ra khi thay thế sản phẩm");
    }
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const openReplaceModal = (productId: number) => {
    setReplacingProductId(productId);
    setNewProductId(null);
    setShowReplaceModal(true);
  };

  const closeReplaceModal = () => {
    setShowReplaceModal(false);
    setReplacingProductId(null);
    setNewProductId(null);
    setReplaceSearchTerm("");
  };

  // Lọc sản phẩm theo search term
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lọc sản phẩm có thể thay thế (không bao gồm sản phẩm đã có trong section)
  const availableProductsForReplacement = allProducts.filter(
    (product) => !section?.products?.some((sp) => sp.id === product.id)
  );

  // Lọc sản phẩm trong modal thay thế theo search term
  const filteredReplaceProducts = availableProductsForReplacement.filter(
    (product) =>
      product.name.toLowerCase().includes(replaceSearchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  if (error) {
    return <div className="error-container">Lỗi: {error}</div>;
  }

  if (!section) {
    return <div className="error-container">Không tìm thấy section</div>;
  }

  return (
    <div className="home-section-products-container">
      <div className="home-section-header">
        <h1 className="home-section-title">
          Quản lý sản phẩm - {section.name}
        </h1>
        <p className="home-section-description">
          Thêm, xóa hoặc thay thế sản phẩm trong section này
        </p>
      </div>

      {/* Sản phẩm hiện tại trong section */}
      <div className="current-products-section">
        <h2 className="current-products-title">
          Sản phẩm hiện tại ({section.products?.length || 0})
        </h2>
        {section.products && section.products.length > 0 ? (
          <div className="current-products-grid">
            {section.products.map((product) => (
              <div key={product.id} className="current-product-card">
                <img
                  src={product.image || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="current-product-image"
                />
                <h3 className="current-product-name">{product.name}</h3>
                <p className="current-product-price">
                  {formatCurrency(product.price || 0)}
                </p>
                <div className="current-product-actions">
                  <button
                    onClick={() => openReplaceModal(product.id)}
                    className="btn-replace"
                  >
                    Thay thế
                  </button>
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="btn-remove"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-title">
              Chưa có sản phẩm nào trong section này
            </p>
            <p className="empty-state-description">
              Hãy thêm sản phẩm từ danh sách bên dưới
            </p>
          </div>
        )}
      </div>

      {/* Thêm sản phẩm mới */}
      <div className="add-products-section">
        <h2 className="add-products-title">Thêm sản phẩm mới</h2>

        {/* Tìm kiếm sản phẩm */}
        <div className="search-container">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn-clear-search"
              >
                Xóa
              </button>
            )}
          </div>
          <p className="search-stats">
            Hiển thị {filteredProducts.length} / {allProducts.length} sản phẩm
          </p>
        </div>

        {/* Danh sách tất cả sản phẩm */}
        <div className="mb-4">
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const isInSection = section.products?.some(
                (p) => p.id === product.id
              );
              const isSelected = selectedProducts.includes(product.id);

              return (
                <div
                  key={product.id}
                  className={`product-card ${
                    isInSection ? "disabled" : isSelected ? "selected" : ""
                  }`}
                  onClick={() =>
                    !isInSection && handleProductSelect(product.id)
                  }
                >
                  <img
                    src={product.image || "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="product-image"
                  />
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">
                    {formatCurrency(product.price || 0)}
                  </p>
                  {isInSection && (
                    <span className="product-status in-section">
                      ✓ Đã có trong section
                    </span>
                  )}
                  {!isInSection && isSelected && (
                    <span className="product-status selected">✓ Đã chọn</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút thêm sản phẩm */}
        {selectedProducts.length > 0 && (
          <div className="action-buttons">
            <button onClick={handleAddProducts} className="btn-add-products">
              ➕ Thêm {selectedProducts.length} sản phẩm vào section
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="btn-cancel-selection"
            >
              Hủy chọn
            </button>
          </div>
        )}
      </div>

      {/* Modal thay thế sản phẩm */}
      {showReplaceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Thay thế sản phẩm</h3>
            <p className="modal-description">
              Chọn sản phẩm mới để thay thế sản phẩm hiện tại
            </p>

            <div className="modal-form-group">
              <label className="modal-label">Sản phẩm mới:</label>

              {/* Tìm kiếm trong modal */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={replaceSearchTerm}
                  onChange={(e) => setReplaceSearchTerm(e.target.value)}
                  className="modal-search-input"
                />
              </div>

              <select
                value={newProductId || ""}
                onChange={(e) => setNewProductId(Number(e.target.value))}
                className="modal-select"
              >
                <option value="">Chọn sản phẩm...</option>
                {filteredReplaceProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price || 0)}
                  </option>
                ))}
              </select>

              {replaceSearchTerm && (
                <p className="modal-stats">
                  Hiển thị {filteredReplaceProducts.length} /{" "}
                  {availableProductsForReplacement.length} sản phẩm
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={closeReplaceModal} className="btn-cancel">
                Hủy
              </button>
              <button
                onClick={handleReplaceProduct}
                disabled={!newProductId}
                className="btn-replace-confirm"
              >
                Thay thế
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSectionProducts;
