import { Controller, Get, Post, Delete, Put, Body } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemAddRequestDTO } from '../domain/item/dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../domain/item/dto/item.update.request.dto';
import { ItemDeleteRequestDTO } from '../domain/item/dto/item.delete.request.dto';

@Controller('api/items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  async getList() {
    return this.itemService.getList();
  }

  @Post('add')
  async add(@Body() dto: ItemAddRequestDTO) {
    return this.itemService.add(dto);
  }

  @Delete('delete')
  async delete(@Body() dto: ItemDeleteRequestDTO) {
    return this.itemService.delete(dto.item_uuid);
  }

  @Put('update')
  async update(@Body() dto: ItemUpdateRequestDTO) {
    return this.itemService.update(dto);
  }
}
