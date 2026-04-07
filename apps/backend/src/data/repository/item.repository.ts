import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Item } from '../../domain/item/item';
import { IItemRepository } from '../../domain/item/item.repository.interface';

@Injectable()
export class ItemRepository implements IItemRepository {
  constructor(private prisma: PrismaService) {}

  async getById(id: number): Promise<Item | null> {
    const items = await this.prisma.item.findMany();
    const item = items[id - 1];
    if (!item) return null;
    return this.mapToEntity(item);
  }

  async add(entity: Omit<Item, 'id'>): Promise<number> {
    const inventories = await this.prisma.inventory.findMany();
    const inventory = inventories[entity.inventory_id - 1];
    if (!inventory) return 0;

    const item = await this.prisma.item.create({
      data: {
        inventoryId: inventory.id,
        name: entity.name,
        quantity: entity.quantity,
        quantityUnit: entity.quantity_unit,
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
        quantity: entity.quantity ?? item.quantity,
        quantityUnit: entity.quantity_unit ?? item.quantityUnit,
      },
    });
    return 1;
  }

  private mapToEntity(i: any): Item {
    return {
      id: parseInt(i.id.replace(/-/g, '').slice(0, 8), 16),
      inventory_id: parseInt(i.inventoryId.replace(/-/g, '').slice(0, 8), 16),
      name: i.name,
      quantity: i.quantity,
      quantity_unit: i.quantityUnit,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }
}
