import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemRepository } from '../../data/repository/item.repository';
import { InventoryRepository } from '../../data/repository/inventory.repository';
import { ItemUseCase } from '../../domain/item/usecases/item.usecases';

@Module({
  controllers: [ItemController],
  providers: [ItemRepository, InventoryRepository, ItemUseCase],
})
export class ItemModule {}
