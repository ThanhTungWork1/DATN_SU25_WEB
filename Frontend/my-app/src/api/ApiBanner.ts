import type { Banner } from "../types/BannerType";
import { config } from "./axios";

export async function getBanners(): Promise<Banner[]> {
  const { data } = await config.get("/banners");
  const res: any = data;
  if (Array.isArray(res)) return res as Banner[];
  if (Array.isArray(res.data)) return res.data as Banner[];
  return [];
}

export const getAllBanners = async () => {
  const response = await config.get("/banners");
  const data = response.data as { data: { id: number; image: string; link: string }[] };
  return data.data;
};
