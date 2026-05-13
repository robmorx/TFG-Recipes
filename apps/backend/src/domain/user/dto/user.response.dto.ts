export class UserResponseDTO {
  user_uuid: string;
  name: string;
  email: string;
  role: string;
  dailyRecipeCount: number;
  dailyRecipeLimit: number;
  createdAt: Date;
}
