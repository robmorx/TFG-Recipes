import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Inventory } from '../../domain/inventory/inventory';
import { IInventoryRepository } from '../../domain/inventory/inventory.repository.interface';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private prisma: PrismaService) {}

  async getByUserUUID(user_uuid: string): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { userId: user_uuid },
      include: { items: true },
    });
    if (!inventory) return null;
    return this.mapToEntity(inventory);
  }

  async add(entity: { user_uuid: string }): Promise<number> {
    const inventory = await this.prisma.inventory.create({
      data: {
        userId: entity.user_uuid,
      },
    });
    return parseInt(inventory.id.replace(/-/g, '').slice(0, 8), 16);
  }

  async delete(id: number): Promise<number> {
    const inventories = await this.prisma.inventory.findMany();
    const inventory = inventories[id - 1];
    if (!inventory) return 0;
    await this.prisma.inventory.delete({ where: { id: inventory.id } });
    return 1;
  }

  private mapToEntity(i: any): Inventory {
    return {
      id: parseInt(i.id.replace(/-/g, '').slice(0, 8), 16),
      inventory_uuid: i.id,
      user_uuid: i.userId,
      items: i.items.map((item: any) => ({
        id: parseInt(item.id.replace(/-/g, '').slice(0, 8), 16),
        inventory_id: parseInt(
          item.inventoryId.replace(/-/g, '').slice(0, 8),
          16,
        ),
        name: item.name,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }
}
