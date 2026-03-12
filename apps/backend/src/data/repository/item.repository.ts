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

  async add(entity: Omit<Item, 'id'>): Promise<number> {
    const item = await this.prisma.item.create({
      data: {
        name: entity.name,
      },
    });
    return parseInt(item.id.replace(/-/g, '').slice(0, 8), 16);
  }

  async delete(id: number): Promise<number> {
    const items = await this.prisma.item.findMany();
    const item = items[id - 1];
    if (!item) return 0;
    await this.prisma.item.delete({ where: { id: item.id } });
    return 1;
  }

  async update(id: number, entity: Partial<Item>): Promise<number> {
    const items = await this.prisma.item.findMany();
    const item = items[id - 1];
    if (!item) return 0;
    await this.prisma.item.update({
      where: { id: item.id },
      data: {
        name: entity.name ?? item.name,
      },
    });
    return 1;
  }

  private mapToEntity(i: any): Item {
    return {
      id: parseInt(i.id.replace(/-/g, '').slice(0, 8), 16),
      item_uuid: i.id,
      name: i.name,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }
}
