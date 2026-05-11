import { injectable } from 'inversify';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { apiClient } from '../network/api-client';

@injectable()
export class AuthRepository implements IAuthRepository {
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    return apiClient.post('/auth/refresh', { refresh_token: refreshToken });
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    return apiClient.post('/auth/logout', { refresh_token: refreshToken });
  }
}
