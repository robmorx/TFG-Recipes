import { User } from '../entities/user';

export interface IUserUseCase {
  get(): Promise<User | null>;
  getList(): Promise<User[]>;
  post(user: { name: string; email: string; password: string }): Promise<User>;
  login(credentials: { email: string; password: string }): Promise<{ token: string; refreshToken: string; user: User }>;
  verifyAccount(email: string, code: string): Promise<{ message: string }>;
  forgotPassword(email: string): Promise<{ message: string }>;
  verifyResetCode(email: string, code: string): Promise<{ message: string }>;
  resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }>;
  delete(user_uuid: string): Promise<{ message?: string }>;
}
