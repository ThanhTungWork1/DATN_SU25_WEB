import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

interface BannerItem {
  id: number;
  image_url: string;
  public_id?: string;
  status: boolean;
  created_at?: string;
}

const BannerEdit: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [previews, setPreviews] = useState<Record<number, string | null>>({});
  const [files, setFiles] = useState<Record<number, File | null>>({});

  const fetchBanners = async () => {
    try {
      const res = await axiosInstance.get<{ data: BannerItem[] }>("/admin/banners");
      const list: BannerItem[] = res.data?.data || [];
      setBanners(list);
    } catch (e) {
      console.error('Load banners failed', e);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onFileChange = (id: number, f: File | null) => {
    setFiles((prev) => ({ ...prev, [id]: f }));
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviews((p) => ({ ...p, [id]: url }));
    } else {
      setPreviews((p) => ({ ...p, [id]: null }));
    }
  };

  const toggleStatus = (id: number, checked: boolean) => {
    setBanners((prev) => prev.map(b => b.id === id ? { ...b, status: checked } : b));
  };

  const onUpdate = async (id: number) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    const form = new FormData();
    const file = files[id];
    if (file) form.append('image', file);
    form.append('status', String(banner.status ? 1 : 0));

    try {
      setLoadingIds((s) => [...s, id]);
      const res = await axiosInstance.put<{ message?: string }>(`/admin/banners/${id}`, form);
      alert(res.data?.message || 'Cập nhật thành công');
      // refresh row
      await fetchBanners();
      // clear file + preview for this id
      setFiles((prev) => ({ ...prev, [id]: null }));
      setPreviews((prev) => ({ ...prev, [id]: null }));
    } catch (e: any) {
      console.error('Update banner failed', e);
      alert(e?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoadingIds((s) => s.filter(x => x !== id));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Sửa Banner</h2>
      <p className="text-sm text-gray-600 mb-6">Chỉ sửa ảnh hoặc trạng thái. Không hỗ trợ thêm/xóa.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b) => {
          const loading = loadingIds.includes(b.id);
          const preview = previews[b.id] ?? null;
          return (
            <div key={b.id} className="border rounded p-3">
              <div className="text-sm font-medium mb-2">Banner #{b.id}</div>
              <img
                src={preview || b.image_url}
                alt={`banner-${b.id}`}
                className="w-full h-40 object-cover rounded border"
              />
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm mb-1">Đổi ảnh</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange(b.id, e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={`status-${b.id}`}
                    type="checkbox"
                    checked={b.status}
                    onChange={(e) => toggleStatus(b.id, e.target.checked)}
                  />
                  <label htmlFor={`status-${b.id}`}>Kích hoạt (hiển thị)</label>
                </div>
                <button
                  className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                  disabled={loading}
                  onClick={() => onUpdate(b.id)}
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BannerEdit;
