import { useEffect, useState } from "react";
import "../../../assets/styles/VoucherPage.css";
import axiosInstance from "../../../utils/axiosInstance";
import { Voucher } from "../../../types/Voucher";

interface ApiResponsePaginated<T> {
  status: string;
  message: string;
  data: {
    current_page: number;
    last_page: number;
    data: T[];
  };
}

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [form, setForm] = useState({
    code: "",
    discount_amount: 0,
    expires_at: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchVouchers = async (page = 1) => {
    try {
      const res = await axiosInstance.get<ApiResponsePaginated<Voucher>>(
        `/vouchers?page=${page}`
      );
      const { data } = res.data;
      setVouchers(data.data || []);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setVouchers([]);
    }
  };

  useEffect(() => {
    fetchVouchers(currentPage);
  }, [currentPage]);

  const formatCurrency = (value: number | string) => {
    const numericValue =
      typeof value === "string"
        ? parseInt(value.replace(/\D/g, "")) || 0
        : value;
    return numericValue.toLocaleString("vi-VN");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(raw || "0");
    setForm({ ...form, discount_amount: numericValue });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        discount_amount: Number(form.discount_amount),
      };
      if (isEditing && editId !== null) {
        await axiosInstance.put(`/vouchers/${editId}`, payload);
      } else {
        await axiosInstance.post("/vouchers", payload);
      }
      resetForm();
      fetchVouchers(currentPage);
    } catch (error: any) {
      console.error("Error saving voucher:", error);
      if (error.response?.data?.errors) {
        alert("Lỗi validation: " + JSON.stringify(error.response.data.errors));
      }
    }
  };

  const resetForm = () => {
    setForm({ code: "", discount_amount: 0, expires_at: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (voucher: Voucher) => {
    setForm({
      code: voucher.code,
      discount_amount: voucher.value,
      expires_at: voucher.end_date,
    });
    setIsEditing(true);
    setEditId(voucher.id);
  };