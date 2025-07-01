export type Review = {
  id: number;
  product_id: number;
  user: { id: number; username: string };
  rating: number;
  content: string;
  created_at: string;
}; 