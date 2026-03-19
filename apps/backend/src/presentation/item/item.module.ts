import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemRepository } from '../../data/repository/item.repository';
import { ItemUseCase } from '../../domain/item/usecases/item.usecases';

@Module({
  controllers: [ItemController],
  providers: [ItemRepository, ItemUseCase],
})
export class ItemModule {}
