import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Inventory } from '../../domain/inventory/inventory';
import { IInventoryRepository } from '../../domain/inventory/inventory.repository.interface';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private prisma: PrismaService) {}

  async getByUserUUID(user_uuid: string): Promise<Inventory | null> {
    console.log('[DEBUG] getByUserUUID called with:', user_uuid);
    const inventory = await this.prisma.inventory.findUnique({
      where: { userId: user_uuid },
      include: { items: true },
    });
    console.log('[DEBUG] Found inventory:', inventory);
    if (!inventory) return null;
    return this.mapToEntity(inventory);
  }

  async add(entity: { user_uuid: string }): Promise<Inventory> {
    console.log(
      '[DEBUG] InventoryRepository.add called with user_uuid:',
      entity.user_uuid,
    );
    const inventory = await this.prisma.inventory.create({
      data: {
        userId: entity.user_uuid,
      },
    });
    console.log('[DEBUG] Created inventory:', inventory);
    return this.mapToEntity(inventory);
  }

  async delete(userUuid: string): Promise<number> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { userId: userUuid },
    });
    if (!inventory) return 0;
    await this.prisma.inventory.delete({ where: { id: inventory.id } });
    return 1;
  }

  private mapToEntity(i: any): Inventory {
    console.log('[DEBUG] mapToEntity - raw inventory:', i);
    console.log('[DEBUG] mapToEntity - items:', i.items);
    return {
      id: i.id,
      inventory_uuid: i.id,
      user_uuid: i.userId,
      items: i.items.map((item: any) => ({
        id: item.id,
        inventory_id: item.inventoryId,
        name: item.name,
        quantity: item.quantity,
        quantityUnit: item.quantityUnit,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }
}
