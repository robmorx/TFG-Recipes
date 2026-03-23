import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Item } from '../../domain/item/item';
import { IItemRepository } from '../../domain/item/item.repository.interface';

@Injectable()
export class ItemRepository implements IItemRepository {
  constructor(private prisma: PrismaService) {}

  async getList(): Promise<Item[]> {
    const items = await this.prisma.item.findMany();
    return items.map((i) => this.mapToEntity(i));
  }

  async getByUUID(uuid: string): Promise<Item | null> {
    const item = await this.prisma.item.findUnique({ where: { id: uuid } });
    if (!item) return null;
    return this.mapToEntity(item);
  }

  async add(entity: Omit<Item, 'id'>): Promise<string> {
    const item = await this.prisma.item.create({
      data: {
        name: entity.name,
      },
    });
    return item.id;
  }

  async delete(uuid: string): Promise<number> {
    const item = await this.prisma.item.findUnique({ where: { id: uuid } });
    if (!item) return 0;
    await this.prisma.item.delete({ where: { id: uuid } });
    return 1;
  }

  async update(uuid: string, entity: Partial<Item>): Promise<number> {
    const item = await this.prisma.item.findUnique({ where: { id: uuid } });
    if (!item) return 0;
    await this.prisma.item.update({
      where: { id: uuid },
      data: {
        name: entity.name ?? item.name,
      },
    });
    return 1;
  }

  private mapToEntity(i: any): Item {
    return {
      id: 0,
      item_uuid: i.id,
      name: i.name,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }
}
