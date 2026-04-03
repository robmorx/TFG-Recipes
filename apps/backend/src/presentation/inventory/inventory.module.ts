import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from '../../data/repository/inventory.repository';
import { InventoryUseCase } from '../../domain/inventory/usecases/inventory.usecases';

@Module({
  controllers: [InventoryController],
  providers: [InventoryRepository, InventoryUseCase],
})
export class InventoryModule {}
