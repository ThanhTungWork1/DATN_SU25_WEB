export interface IUser {
  id: string; 
  name: string;
  email: string;
  password?: string; 
  phone?: string;
  address?: string;
  role: string;
  status: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}
