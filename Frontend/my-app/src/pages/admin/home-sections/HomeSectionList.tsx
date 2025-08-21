import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ApiHomeSection } from "../../../api/ApiHomeSection";
import { HomeSection } from "../../../types/HomeSection";

const HomeSectionList = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await ApiHomeSection.getHomeSections();
      setSections(response.sections);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu sections");
      console.error("Error fetching sections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiHomeSection.createSection(formData);
      setShowCreateForm(false);
      setFormData({ name: "", title: "", description: "" });
      fetchSections();
      toast.success("Tạo section thành công!");
    } catch (err) {
      console.error("Error creating section:", err);
      toast.error("Có lỗi xảy ra khi tạo section");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      await ApiHomeSection.updateSection(editingSection.id, {
        title: formData.title,
        description: formData.description,
      });
      setEditingSection(null);
      setFormData({ name: "", title: "", description: "" });
      fetchSections();
      toast.success("Cập nhật section thành công!");
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error("Có lỗi xảy ra khi cập nhật section");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ApiHomeSection.deleteSection(id);
      fetchSections();
      toast.success("Xóa section thành công!");
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error("Có lỗi xảy ra khi xóa section");
    }
  };

  const handleEdit = (section: HomeSection) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      title: section.title,
      description: section.description || "",
    });
  };

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold mb-2 text-gray-900">
          Quản lý Home Sections
        </h1>
        <p className="text-gray-800">
          Tạo và quản lý các section hiển thị trên trang chủ
        </p>
      </div>

      {/* Nút thêm section mới */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Thêm Section Mới
        </button>
      </div>

      {/* Form tạo mới */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Thêm Section Mới</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Tên section
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: featured_products"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Tiêu đề hiển thị
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sản phẩm nổi bật"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Mô tả (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Mô tả ngắn gọn"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Tạo Section
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-danger"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form chỉnh sửa */}
      {editingSection && (
        <div className="mb-6 p-4 border rounded bg-yellow-50">
          <h3 className="text-lg font-semibold mb-4">Chỉnh sửa Section</h3>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiêu đề hiển thị
                </label>
                <input
                  type="text"
                  placeholder="Tiêu đề hiển thị"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mô tả (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Mô tả ngắn gọn"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="btn btn-danger"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border rounded p-4 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {section.name}
                </h3>
                <p className="text-gray-900">{section.title}</p>
                {section.description && (
                  <p className="text-base text-gray-700">
                    {section.description}
                  </p>
                )}
                <p className="text-sm text-blue-600">
                  {section.products?.length || 0} sản phẩm
                </p>
                <p className="text-sm text-gray-700">
                  Trạng thái: {section.status ? "Hoạt động" : "Không hoạt động"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    (window.location.href = `/admin/home-sections/${section.id}/products`)
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Quản lý SP
                </button>
                <button
                  onClick={() => handleEdit(section)}
                  className="btn btn-warning btn-sm"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Chưa có section nào được tạo
        </div>
      )}
    </div>
  );
};

export default HomeSectionList;
