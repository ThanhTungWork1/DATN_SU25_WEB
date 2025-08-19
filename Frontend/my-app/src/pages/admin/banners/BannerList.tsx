import React, { useEffect, useState } from 'react';
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
  const [data, setData] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState<number[]>([]);
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [lastLoadedAt, setLastLoadedAt] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<{ data: BannerItem[] }>('/admin/banners');
      const list = res.data?.data || [];
      setData(list);
      setLastLoadedAt(new Date().toLocaleString());
    } catch (e) {
      console.error(e);
      message.error('Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateRow = async (record: BannerItem) => {
    try {
      setRowLoading((s) => [...s, record.id]);
      const form = new FormData();
      const file = files[record.id];
      if (file) form.append('image', file);
      form.append('status', String(record.status ? 1 : 0));
      // Dùng POST + _method=PUT để đảm bảo server nhận multipart ổn định
      form.append('_method', 'PUT');
      const res = await axiosInstance.post<{ message?: string }>(`/admin/banners/${record.id}`, form);
      message.success(res.data?.message || 'Lưu thành công');
      await fetchData();
      setFiles((prev) => ({ ...prev, [record.id]: null }));
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || 'Cập nhật thất bại');
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
        if (!base) {
          return <div style={{ width: 200, height: 100, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Chưa có ảnh</div>;
        }
        const ts = record.updated_at ? new Date(record.updated_at).getTime() : Date.now();
        const src = `${base}${base.includes('?') ? '&' : '?'}t=${ts}`;
        return (
          <div>
            <Image
              src={src}
              width={200}
              height={100}
              style={{ objectFit: 'cover', borderRadius: 6 }}
              alt={`banner-${record.id}`}
              onError={(e) => {
                console.warn('Không tải được ảnh banner:', src);
              }}
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
              onClick={() => updateRow(record)}
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
