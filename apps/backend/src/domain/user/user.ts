export type UserRole = 'USER' | 'SUPERUSER';

export interface User {
  id: number;
  user_uuid: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpires: Date | null;
  resetPasswordCode: string | null;
  resetPasswordCodeExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
