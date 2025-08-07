export interface IUser {
  id: number; 
  name: string;
  email: string;
  password?: string; 
  phone?: string;
  address?: string;
  role: string;
  status: boolean;
  gender?: "male" | "female" | "other";
  birthdate?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}
