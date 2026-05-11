import { injectable } from 'inversify';
import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { apiClient } from '../network/api-client';
import { tokenStorageService } from '../../core/token-storage.service';

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

  async login(
    credentials: { email: string; password: string },
    rememberMe: boolean,
  ): Promise<{ token: string; refreshToken: string; user: User }> {
    const response = await apiClient.post<{
      access_token: string;
      refresh_token: string;
      user_uuid: string;
      name: string;
      email: string;
    }>('/auth/login', credentials);

    tokenStorageService.setPersistToStorage(rememberMe);
    await tokenStorageService.setTokens(response.access_token, response.refresh_token);

    return {
      token: response.access_token,
      refreshToken: response.refresh_token,
      user: {
        id: response.user_uuid,
        user_uuid: response.user_uuid,
        name: response.name,
        email: response.email,
      },
    };
  }

  async verifyAccount(email: string, code: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/verify-account', { email, code });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async verifyResetCode(email: string, code: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/verify-reset-code', { email, code });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', { email, code, newPassword });
  }
}