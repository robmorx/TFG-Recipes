import { Controller, Post, Delete, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ItemUseCase } from '../../domain/item/usecases/item.usecases';
import { ItemAddRequestDTO } from '../../domain/item/dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../../domain/item/dto/item.update.request.dto';
import { ItemDeleteRequestDTO } from '../../domain/item/dto/item.delete.request.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Items')
@ApiBearerAuth()
@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private readonly itemUseCase: ItemUseCase) {}

  @Post('add')
  @ApiOperation({ summary: 'Add new item to inventory' })
  @ApiResponse({ status: 201, description: 'Item created' })
  async add(@Body() dto: ItemAddRequestDTO) {
    return this.itemUseCase.add(dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete item by internal ID' })
  @ApiResponse({ status: 200, description: 'Item deleted' })
  async delete(@Body() dto: ItemDeleteRequestDTO) {
    return this.itemUseCase.delete(dto.id);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update item' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  async update(@Body() dto: ItemUpdateRequestDTO) {
    return this.itemUseCase.update(dto);
  }
}