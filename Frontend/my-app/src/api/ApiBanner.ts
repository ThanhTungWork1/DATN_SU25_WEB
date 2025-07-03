import type { Banner } from "../types/BannerType";

export async function getBanners(): Promise<Banner[]> {
  const res = await fetch("http://localhost:3000/banners");
  if (!res.ok) throw new Error("Failed to fetch banners");
  return res.json();
}
