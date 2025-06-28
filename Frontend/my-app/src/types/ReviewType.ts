export type Review = {
  id: number;
  product_id: number;
<<<<<<< HEAD
  user: { id: number; username?: string; name?: string };
=======
  user: { id: number; username: string };
>>>>>>> bc9cc18e (spa lai giao dien va cac file code, nang cap serch,filte)
  rating: number;
  content: string;
  created_at: string;
}; 