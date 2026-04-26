import { injectable } from 'inversify';
import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { apiClient } from '../network/api-client';

const USE_API = true;

@injectable()
export class UserRepository implements IUserRepository {
  private mockUser: User | null = {
    id: '1',
    user_uuid: 'user-001',
    name: 'Juan Pérez',
    email: 'juan@example.com',
  };

  async get(): Promise<User | null> {
    if (USE_API) {
      return apiClient.get<User>('/users');
    }
    return this.mockUser;
  }

  async post(user: { name: string; email: string; password: string }): Promise<User> {
    if (USE_API) {
      const created = await apiClient.post<User>('/users/add', user);
      this.mockUser = created;
      apiClient.setToken('mock-token');
      return created;
    }
    const newUser: User = {
      id: Date.now().toString(),
      user_uuid: `user-${Date.now()}`,
      name: user.name,
      email: user.email,
    };
    this.mockUser = newUser;
    apiClient.setToken('mock-token');
    return newUser;
  }

  async getByUUID(user_uuid: string): Promise<User | null> {
    if (USE_API) {
      return apiClient.get<User>(`/users/${user_uuid}`);
    }
    return this.mockUser;
  }
}