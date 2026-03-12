import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../domain/user/user';
import { IUserRepository } from '../../domain/user/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async getList(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => ({
      id: parseInt(u.id.replace(/-/g, '').slice(0, 8), 16),
      user_uuid: u.id,
      name: '',
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  async getById(id: number): Promise<User | null> {
    const users = await this.prisma.user.findMany();
    const user = users[id - 1];
    if (!user) return null;
    return {
      id,
      user_uuid: user.id,
      name: '',
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getByUUID(uuid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id: uuid } });
    if (!user) return null;
    return {
      id: parseInt(user.id.replace(/-/g, '').slice(0, 8), 16),
      user_uuid: user.id,
      name: '',
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async add(entity: Omit<User, 'id'>): Promise<number> {
    const user = await this.prisma.user.create({
      data: {
        email: entity.email,
        password: entity.name,
      },
    });
    return parseInt(user.id.replace(/-/g, '').slice(0, 8), 16);
  }

  async delete(id: number): Promise<number> {
    const users = await this.prisma.user.findMany();
    const user = users[id - 1];
    if (!user) return 0;
    await this.prisma.user.delete({ where: { id: user.id } });
    return 1;
  }

  async update(id: number, entity: Partial<User>): Promise<number> {
    const users = await this.prisma.user.findMany();
    const user = users[id - 1];
    if (!user) return 0;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: entity.email ?? user.email,
      },
    });
    return 1;
  }
}
