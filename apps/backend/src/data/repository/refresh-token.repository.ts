import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshToken } from '../../domain/auth/refresh-token';
import { IRefreshTokenRepository } from '../../domain/auth/refresh-token.repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: Omit<RefreshToken, 'id' | 'created_at'>): Promise<RefreshToken> {
    const token = await this.prisma.refreshToken.create({
      data: {
        tokenHash: entity.token_hash,
        userId: entity.user_uuid,
        expiresAt: entity.expires_at,
        revoked: entity.revoked,
      },
    });
    return this.mapToEntity(token);
  }

  async getByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!token) return null;
    return this.mapToEntity(token);
  }

  async revoke(id: string): Promise<number> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { id },
    });
    if (!token) return 0;
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
    return 1;
  }

  async revokeAllByUser(userUuid: string): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId: userUuid, revoked: false },
      data: { revoked: true },
    });
    return result.count;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true },
        ],
      },
    });
    return result.count;
  }

  private mapToEntity(t: any): RefreshToken {
    return {
      id: t.id,
      token_hash: t.tokenHash,
      user_uuid: t.userId,
      expires_at: t.expiresAt,
      created_at: t.createdAt,
      revoked: t.revoked,
    };
  }
}
