import { Controller, Post, Delete, Put, Body } from '@nestjs/common';
import { ItemUseCase } from '../../domain/item/usecases/item.usecases';
import { ItemAddRequestDTO } from '../../domain/item/dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../../domain/item/dto/item.update.request.dto';
import { ItemDeleteRequestDTO } from '../../domain/item/dto/item.delete.request.dto';

@Controller('api/items')
export class ItemController {
  constructor(private readonly itemUseCase: ItemUseCase) {}

  @Post('add')
  async add(@Body() dto: ItemAddRequestDTO) {
    return this.itemUseCase.add(dto);
  }

  @Delete('delete')
  async delete(@Body() dto: ItemDeleteRequestDTO) {
    return this.itemUseCase.delete(dto.id);
  }

  @Put('update')
  async update(@Body() dto: ItemUpdateRequestDTO) {
    return this.itemUseCase.update(dto);
  }
}
