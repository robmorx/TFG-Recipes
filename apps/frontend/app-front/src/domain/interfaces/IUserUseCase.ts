import { User } from '../entities/user';

export interface IUserUseCase {
  get(): User | undefined;
  post(user: User): void;
}
