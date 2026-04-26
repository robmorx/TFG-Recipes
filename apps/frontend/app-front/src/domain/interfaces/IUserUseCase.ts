import { User } from '../entities/user';

export interface IUserUseCase {
  get(): Promise<User | null>;
  post(user: { name: string; email: string; password: string }): Promise<User>;
}
