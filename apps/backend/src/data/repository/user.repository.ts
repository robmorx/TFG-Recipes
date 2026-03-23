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
      user_uuid: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  async getByUUID(uuid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id: uuid } });
    if (!user) return null;
    return {
      user_uuid: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async add(entity: Omit<User, 'id'>): Promise<string> {
    const user = await this.prisma.user.create({
      data: {
        name: entity.name,
        email: entity.email,
        password: entity.password,
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
}
