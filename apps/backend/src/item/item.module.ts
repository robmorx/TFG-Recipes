import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemRepository } from '../data/repository/item.repository';

@Module({
  controllers: [ItemController],
  providers: [ItemService, ItemRepository],
  exports: [ItemService],
})
export class ItemModule {}
