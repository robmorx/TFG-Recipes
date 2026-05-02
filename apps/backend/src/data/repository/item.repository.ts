import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Item } from '../../domain/item/item';
import { IItemRepository } from '../../domain/item/item.repository.interface';

@Injectable()
export class ItemRepository implements IItemRepository {
  constructor(private prisma: PrismaService) {}

  async getById(id: string): Promise<Item | null> {
    const item = await this.prisma.item.findUnique({
      where: { id: id },
    });
    if (!item) return null;
    return this.mapToEntity(item);
  }

  async findByNameAndInventoryId(name: string, inventoryId: string): Promise<Item | null> {
    const item = await this.prisma.item.findFirst({
      where: {
        name: name,
        inventoryId: inventoryId,
      },
    });
    if (!item) return null;
    return this.mapToEntity(item);
  }

  async add(entity: Omit<Item, 'id'>): Promise<Item> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id: entity.inventory_id },
    });
    if (!inventory) throw new Error('Inventory not found');

    const item = await this.prisma.item.create({
      data: {
        inventoryId: inventory.id,
        name: entity.name,
        quantity: entity.quantity,
        quantityUnit: entity.quantity_unit,
      },
    });
    return this.mapToEntity(item);
  }

  async delete(id: string): Promise<number> {
    const item = await this.prisma.item.findUnique({
      where: { id: id },
    });
    if (!item) return 0;
    await this.prisma.item.delete({ where: { id: item.id } });
    return 1;
  }

  async update(id: string, entity: Partial<Item>): Promise<number> {
    const item = await this.prisma.item.findUnique({
      where: { id: id },
    });
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
      id: i.id,
      inventory_id: i.inventoryId,
      name: i.name,
      quantity: i.quantity,
      quantity_unit: i.quantityUnit,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }
}
