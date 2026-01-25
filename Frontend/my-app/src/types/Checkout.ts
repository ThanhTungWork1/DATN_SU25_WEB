export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant_id?: number;
}

export interface Address {
  street: string;
  ward: string;
  district: string;
  province: string;
}

export interface Voucher {
  id: number;
  code: string;
  discount_amount: number;
}

// --- Type Definitions for Geo API ---
export interface GeoUnit {
  name: string;
  code: number;
}

export interface Province extends GeoUnit {
  districts?: District[];
}

export interface District extends GeoUnit {
  wards?: Ward[];
}

export interface Ward extends GeoUnit {}
