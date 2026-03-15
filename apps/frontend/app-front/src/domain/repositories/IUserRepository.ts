import { User } from '../entities/user';

export interface IUserRepository {
  get(): User | undefined;
  post(user: User): void;
}
