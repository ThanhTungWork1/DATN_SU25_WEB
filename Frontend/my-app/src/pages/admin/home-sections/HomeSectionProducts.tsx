import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ApiHomeSection } from '../../../api/ApiHomeSection';
import { getAllProducts } from '../../../api/ApiProduct';
import { HomeSection, Product } from '../../../types/HomeSection';

const HomeSectionProducts = () => {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<HomeSection | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  // State cho chức năng thay thế sản phẩm
  const [replacingProductId, setReplacingProductId] = useState<number | null>(null);
  const [newProductId, setNewProductId] = useState<number | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replaceSearchTerm, setReplaceSearchTerm] = useState<string>('');

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
        description: '',
        status: true,
        created_at: '',
        updated_at: '',
        products: response.products || []
      };
      setSection(sectionData);
    } catch (err) {
      setError('Không thể tải dữ liệu section');
      console.error('Error fetching section:', err);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await getAllProducts();
      setAllProducts(response || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    try {
      await ApiHomeSection.addProductsToSection(parseInt(id!), selectedProducts);
      setSelectedProducts([]);
      fetchSectionData();
      alert('Đã thêm sản phẩm vào section thành công!');
    } catch (err) {
      console.error('Error adding products:', err);
      alert('Có lỗi xảy ra khi thêm sản phẩm');
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi section?')) {
      try {
        await ApiHomeSection.removeProductFromSection(parseInt(id!), productId);
        fetchSectionData();
        alert('Đã xóa sản phẩm khỏi section thành công!');
      } catch (err) {
        console.error('Error removing product:', err);
        alert('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  };

  const handleReplaceProduct = async () => {
    if (!replacingProductId || !newProductId) {
      alert('Vui lòng chọn sản phẩm mới');
      return;
    }

    try {
      // Xóa sản phẩm cũ
      await ApiHomeSection.removeProductFromSection(parseInt(id!), replacingProductId);
      // Thêm sản phẩm mới
      await ApiHomeSection.addProductsToSection(parseInt(id!), [newProductId]);
      
      // Reset state
      setReplacingProductId(null);
      setNewProductId(null);
      setShowReplaceModal(false);
      
      // Refresh data
      fetchSectionData();
      alert('Đã thay thế sản phẩm thành công!');
    } catch (err) {
      console.error('Error replacing product:', err);
      alert('Có lỗi xảy ra khi thay thế sản phẩm');
    }
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
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
    setReplaceSearchTerm('');
  };

  // Lọc sản phẩm theo search term
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lọc sản phẩm có thể thay thế (không bao gồm sản phẩm đã có trong section)
  const availableProductsForReplacement = allProducts.filter(product => 
    !section?.products?.some(sp => sp.id === product.id)
  );

  // Lọc sản phẩm trong modal thay thế theo search term
  const filteredReplaceProducts = availableProductsForReplacement.filter(product =>
    product.name.toLowerCase().includes(replaceSearchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  }

  if (!section) {
    return <div className="p-4">Không tìm thấy section</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Quản lý sản phẩm - {section.name}</h1>
        <p className="text-gray-600">Thêm, xóa hoặc thay thế sản phẩm trong section này</p>
      </div>

      {/* Sản phẩm hiện tại trong section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm hiện tại ({section.products?.length || 0})</h2>
        {section.products && section.products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.products.map((product) => (
              <div key={product.id} className="border rounded p-4 bg-white">
                <img 
                  src={product.image || "https://via.placeholder.com/150"} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">{product.price?.toLocaleString()}đ</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => openReplaceModal(product.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Thay thế
                  </button>
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có sản phẩm nào trong section này</p>
            <p className="text-sm mt-2">Hãy thêm sản phẩm từ danh sách bên dưới</p>
          </div>
        )}
      </div>

      {/* Thêm sản phẩm mới */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Thêm sản phẩm mới</h2>
        
        {/* Tìm kiếm sản phẩm */}
        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Xóa
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Hiển thị {filteredProducts.length} / {allProducts.length} sản phẩm
          </p>
        </div>
        
        {/* Danh sách tất cả sản phẩm */}
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => {
              const isInSection = section.products?.some(p => p.id === product.id);
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <div 
                  key={product.id} 
                  className={`border rounded p-4 cursor-pointer ${
                    isInSection ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 
                    isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => !isInSection && handleProductSelect(product.id)}
                >
                  <img 
                    src={product.image || "https://via.placeholder.com/150"} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600">{product.price?.toLocaleString()}đ</p>
                  {isInSection && (
                    <span className="text-sm text-green-600">✓ Đã có trong section</span>
                  )}
                  {!isInSection && isSelected && (
                    <span className="text-sm text-blue-600">✓ Đã chọn</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút thêm sản phẩm */}
        {selectedProducts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleAddProducts}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Thêm {selectedProducts.length} sản phẩm vào section
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Hủy chọn
            </button>
          </div>
        )}
      </div>

      {/* Modal thay thế sản phẩm */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Thay thế sản phẩm</h3>
            <p className="text-gray-600 mb-4">
              Chọn sản phẩm mới để thay thế sản phẩm hiện tại
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Sản phẩm mới:
              </label>
              
              {/* Tìm kiếm trong modal */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={replaceSearchTerm}
                  onChange={(e) => setReplaceSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={newProductId || ''}
                onChange={(e) => setNewProductId(Number(e.target.value))}
                className="w-full border p-2 rounded"
              >
                <option value="">Chọn sản phẩm...</option>
                {filteredReplaceProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.price?.toLocaleString()}đ
                  </option>
                ))}
              </select>
              
              {replaceSearchTerm && (
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị {filteredReplaceProducts.length} / {availableProductsForReplacement.length} sản phẩm
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeReplaceModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReplaceProduct}
                disabled={!newProductId}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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