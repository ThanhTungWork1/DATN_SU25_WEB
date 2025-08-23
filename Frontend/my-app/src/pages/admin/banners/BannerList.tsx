import React, { useState, useEffect } from 'react';
import "../../../assets/styles/admin-responsive.css";
import { Table, Image, Switch, Upload, Button, Space, message, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import axiosInstance from '../../../utils/axiosInstance';

interface BannerItem {
  id: number;
  image_url: string;
  public_id?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

const BannerList: React.FC = () => {
  console.log('🎯 BannerList component rendering');
  const [data, setData] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState<number[]>([]);
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [lastLoadedAt, setLastLoadedAt] = useState<string>("");

  const fetchData = async () => {
    console.log('🔄 fetchData started');
    setLoading(true);
    try {
      // Thêm timestamp để tránh cache
      const timestamp = Date.now();
      console.log('📡 Making API call to /admin/banners');
      const res = await axiosInstance.get<{ data: BannerItem[] }>(`/admin/banners?t=${timestamp}`);
      console.log('✅ API response received:', res);
      console.log('📊 Response data:', res.data);
      const list = res.data?.data || [];
      console.log('📋 Banner list:', list);
      
      if (list.length === 0) {
        console.warn('⚠️ No banners found in response');
      }
      
      list.forEach(item => {
        console.log(`🖼️ Banner ${item.id}:`, {
          image_url: item.image_url,
          public_id: item.public_id,
          status: item.status
        });
      });
      
      // Đảm bảo dữ liệu có đúng format
      const formattedList = list.map(item => ({
        ...item,
        status: Boolean(item.status), // Đảm bảo status là boolean
        image_url: item.image_url || '', // Đảm bảo image_url không null
      }));
      
      setData(formattedList);
      setLastLoadedAt(new Date().toLocaleString());
    } catch (e: any) {
      console.error('❌ Error fetching banners:', e);
      console.error('❌ Error details:', {
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status
      });
      message.error('Không thể tải danh sách banner');
    } finally {
      console.log('🏁 fetchData finished');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 BannerList component mounted, calling fetchData');
    fetchData();
  }, []);

  const updateRow = async (record: BannerItem) => {
    try {
      setRowLoading((s) => [...s, record.id]);
      const form = new FormData();
      const file = files[record.id];
      
      console.log('🔄 Starting update for banner ID:', record.id);
      console.log('📊 Current status:', record.status);
      console.log('📁 Has file:', !!file);
      console.log('📁 File details:', file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : 'No file');
      
      if (file) {
        form.append('image', file);
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      }
      
      form.append('status', String(record.status ? 1 : 0));
      form.append('_method', 'PUT');
      
      console.log('📋 FormData contents:');
      for (let [key, value] of form.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      console.log('📡 Sending POST request to:', `/admin/banners/${record.id}`);
      const res = await axiosInstance.post<{ message?: string }>(`/admin/banners/${record.id}`, form);
      
      console.log('✅ Update response status:', res.status);
      console.log('✅ Update response data:', res.data);
      
      if (res.status === 200 || res.status === 201) {
        message.success(res.data?.message || 'Cập nhật thành công');
        
        // Clear file ngay lập tức
        setFiles((prev) => ({ ...prev, [record.id]: null }));
        
        // Force refresh data với cache busting
        await fetchData();
        
        // Đợi thêm một chút rồi fetch lại lần nữa để đảm bảo
        setTimeout(async () => {
          await fetchData();
        }, 1000);
      } else {
        throw new Error(`Server returned status ${res.status}`);
      }
    } catch (e: any) {
      console.error('Update error:', e);
      console.error('Error status:', e?.response?.status);
      console.error('Error response:', e?.response?.data);
      
      let errorMessage = 'Cập nhật thất bại';
      if (e?.response?.status === 422) {
        errorMessage = 'Dữ liệu không hợp lệ. Kiểm tra định dạng ảnh và kích thước.';
      } else if (e?.response?.status === 413) {
        errorMessage = 'File quá lớn. Vui lòng chọn ảnh nhỏ hơn.';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.response?.data?.errors) {
        const errors = Object.values(e.response.data.errors).flat();
        errorMessage = errors.join(', ');
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      message.error(errorMessage);
      // Không fetch lại data khi có lỗi để giữ nguyên trạng thái
    } finally {
      setRowLoading((s) => s.filter((x) => x !== record.id));
    }
  };

  const columns: ColumnsType<BannerItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (_: string, record) => {
        const file = files[record.id];
        if (file) {
          const local = URL.createObjectURL(file);
          return (
            <Image
              src={local}
              width={200}
              height={100}
              style={{ objectFit: 'cover', borderRadius: 6 }}
              alt={`preview-${record.id}`}
            />
          );
        }
        const base = record.image_url || '';
        console.log(`🖼️ Rendering image for banner ${record.id}:`, base);
        
        if (!base) {
          console.log(`⚠️ No image_url for banner ${record.id}`);
          return <div style={{ width: 200, height: 100, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Chưa có ảnh</div>;
        }
        
        // Không thêm timestamp nếu là URL external
        const src = base.startsWith('http') ? base : `${base}?t=${Date.now()}`;
        console.log(`🔗 Final image src for banner ${record.id}:`, src);
        
        return (
          <div>
            <Image
              src={src}
              width={200}
              height={100}
              style={{ objectFit: 'cover', borderRadius: 6 }}
              alt={`banner-${record.id}`}
              onLoad={() => {
                console.log(`✅ Image loaded successfully for banner ${record.id}:`, src);
              }}
              onError={(e) => {
                console.error(`❌ Failed to load image for banner ${record.id}:`, src, e);
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
            <div style={{ marginTop: 6 }}>
              <a href={src} target="_blank" rel="noreferrer">Mở ảnh</a>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record) => (
        <Switch
          checked={record.status}
          onChange={(checked) =>
            setData((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: checked } : r)))
          }
        />
      ),
      width: 140,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (text: string) => {
        if (!text) return '-';
        return new Date(text).toLocaleString('vi-VN');
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record) => {
        const uploading = rowLoading.includes(record.id);
        return (
          <Space>
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={(file) => {
                console.log('📁 File selected for banner:', record.id, {
                  name: file.name,
                  size: file.size,
                  type: file.type
                });
                setFiles((prev) => ({ ...prev, [record.id]: file }));
                message.success('Đã chọn ảnh, bấm Lưu để cập nhật');
                return false; // prevent auto upload
              }}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {files[record.id] ? (
              <Tag color="blue">{files[record.id]?.name}</Tag>
            ) : null}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={uploading}
              onClick={() => {
                console.log('💾 Save button clicked for banner:', record.id);
                updateRow(record);
              }}
            >
              Lưu
            </Button>
          </Space>
        );
      },
      width: 220,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Quản lý Banner</h2>
          <Tooltip title={`Lần tải gần nhất: ${lastLoadedAt || 'chưa'} `}>
            <Tag color={data.length >= 0 ? 'green' : 'default'}>
              DB OK • {data.length} bản ghi
            </Tag>
          </Tooltip>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>Tải lại</Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BannerList;