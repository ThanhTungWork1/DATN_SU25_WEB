export type Review = {
  id: number;
  product_id: number;
  user: { id: number; username?: string; name?: string };
  rating: number;
  content: string;
  created_at: string;
}; 