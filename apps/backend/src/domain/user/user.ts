export interface User {
  id: number;
  user_uuid: string;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpires: Date | null;
  resetPasswordCode: string | null;
  resetPasswordCodeExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
