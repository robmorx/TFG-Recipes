export interface User {
  id: string;
  user_uuid?: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  dailyRecipeCount?: number;
  dailyRecipeLimit?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
