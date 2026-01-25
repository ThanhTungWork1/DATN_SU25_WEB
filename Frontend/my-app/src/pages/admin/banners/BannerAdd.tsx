import React, { useState, useEffect } from 'react';
import "../../../assets/styles/admin-responsive.css";
import axiosInstance from '../../../utils/axiosInstance';

interface BannerItem {
  id: number;
  image_url: string;
  status: boolean;
  created_at?: string;
}

const BannerAdd: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  const fetchBanners = async () => {
    try {
      const res = await axiosInstance.get<{ data: BannerItem[] }>("/admin/banners");
      // backend returns { data: banners }
      const list: BannerItem[] = res.data?.data || [];
      setBanners(list);
    } catch (e) {
      console.error('Load banners failed', e);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Vui lòng chọn ảnh');
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.append('image', file);
      form.append('status', String(status ? 1 : 0));

      // Admin protected route
      const res = await axiosInstance.post<{ message?: string }>("/admin/banners", form);

      alert(res.data?.message || 'Tạo banner thành công');
      setFile(null);
      setPreview(null);
      setStatus(true);
      await fetchBanners();
    } catch (err: any) {
      console.error('Upload banner failed', err);
      alert(err?.response?.data?.message || 'Tải lên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Thêm Banner</h2>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block font-medium mb-1">Ảnh banner</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {preview && (
            <div className="mt-3">
              <img src={preview} alt="preview" className="max-h-56 rounded border" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="status"
            type="checkbox"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
          />
          <label htmlFor="status">Kích hoạt (hiển thị)</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {loading ? 'Đang tải...' : 'Tạo banner'}
        </button>
      </form>

      <hr className="my-6" />

      <h3 className="text-lg font-semibold mb-3">Danh sách banner</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="border rounded p-2">
            <img src={b.image_url} alt={`banner-${b.id}`} className="w-full h-40 object-cover rounded" />
            <div className="mt-2 text-sm">
              <div>Trạng thái: <span className={b.status ? 'text-green-600' : 'text-gray-500'}>{b.status ? 'Active' : 'Inactive'}</span></div>
              {b.created_at && <div>Ngày tạo: {new Date(b.created_at).toLocaleString('vi-VN')}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerAdd;
