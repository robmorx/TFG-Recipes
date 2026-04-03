import { injectable } from 'inversify';
import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

@injectable()
export class UserRepository implements IUserRepository {
  private user: User | undefined = {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
  };

  get(): User | undefined {
    return this.user;
  }

  post(user: User): void {
    this.user = user;
  }
}
