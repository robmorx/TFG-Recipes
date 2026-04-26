import { User } from '../entities/user';

export interface IUserRepository {
  get(): Promise<User | null>;
  post(user: { name: string; email: string; password: string }): Promise<User>;
  getByUUID(user_uuid: string): Promise<User | null>;
}
