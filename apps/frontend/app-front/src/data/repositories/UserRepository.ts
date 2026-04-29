import { injectable } from 'inversify';
import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { apiClient } from '../network/api-client';

@injectable()
export class UserRepository implements IUserRepository {
  async get(): Promise<User | null> {
    return apiClient.get<User>('/users');
  }

  async post(user: { name: string; email: string; password: string }): Promise<User> {
    const created = await apiClient.post<User>('/users/add', user);
    return created;
  }

  async getByUUID(user_uuid: string): Promise<User | null> {
    return apiClient.get<User>(`/users/${user_uuid}`);
  }

  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const response = await apiClient.post<{ access_token: string; user_uuid: string; name: string; email: string }>('/auth/login', credentials);
    apiClient.setToken(response.access_token);
    return {
      token: response.access_token,
      user: {
        id: response.user_uuid,
        user_uuid: response.user_uuid,
        name: response.name,
        email: response.email,
      },
    };
  }
}