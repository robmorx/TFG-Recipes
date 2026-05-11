import { RefreshToken } from '../auth/refresh-token';

export interface IRefreshTokenRepository {
  create(entity: Omit<RefreshToken, 'id' | 'created_at'>): Promise<RefreshToken>;
  getByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<number>;
  revokeAllByUser(userUuid: string): Promise<number>;
  deleteExpired(): Promise<number>;
}
