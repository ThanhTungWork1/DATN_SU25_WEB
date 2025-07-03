export type Banner = {
  id: number;
  image_url: string;
  public_id: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export interface BannerProps {
  imageUrl: string;
  alt?: string;
} 