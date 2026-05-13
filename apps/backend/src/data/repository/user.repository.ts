import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../domain/user/user';
import { IUserRepository } from '../../domain/user/user.repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async getList(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.mapToEntity(u));
  }

  async getById(id: number): Promise<User | null> {
    const users = await this.prisma.user.findMany();
    const user = users[id - 1];
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async getByUUID(uuid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id: uuid } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async add(entity: Omit<User, 'id'>): Promise<string> {
    const hashedPassword = await bcrypt.hash(entity.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: entity.name,
        email: entity.email,
        password: hashedPassword,
      },
    });
    return user.id;
  }

  async delete(uuid: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: uuid } });
    if (!user) return 0;
    await this.prisma.user.delete({ where: { id: uuid } });
    return 1;
  }

  async update(uuid: string, entity: Partial<User>): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: uuid } });
    if (!user) return 0;
    await this.prisma.user.update({
      where: { id: uuid },
      data: {
        name: entity.name ?? user.name,
        email: entity.email ?? user.email,
      },
    });
    return 1;
  }

  async updatePassword(uuid: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: uuid },
      data: { password: hashedPassword },
    });
  }

  async updateVerificationCode(
    uuid: string,
    code: string,
    expires: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: uuid },
      data: {
        verificationCode: code,
        verificationCodeExpires: expires,
      },
    });
  }

  async verifyUser(uuid: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: uuid },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });
  }

  async updateResetPasswordCode(
    uuid: string,
    code: string,
    expires: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: uuid },
      data: {
        resetPasswordCode: code,
        resetPasswordCodeExpires: expires,
      },
    });
  }

  async clearResetPasswordCode(uuid: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: uuid },
      data: {
        resetPasswordCode: null,
        resetPasswordCodeExpires: null,
      },
    });
  }

  private mapToEntity(u: any): User {
    return {
      id: parseInt(u.id.replace(/-/g, '').slice(0, 8), 16),
      user_uuid: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role ?? 'USER',
      isVerified: u.isVerified,
      verificationCode: u.verificationCode,
      verificationCodeExpires: u.verificationCodeExpires,
      resetPasswordCode: u.resetPasswordCode,
      resetPasswordCodeExpires: u.resetPasswordCodeExpires,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
