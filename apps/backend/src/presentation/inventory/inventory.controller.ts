import { Controller, Get, Delete, Body, Param } from '@nestjs/common';
import { InventoryUseCase } from '../../domain/inventory/usecases/inventory.usecases';
import { InventoryGetByUserRequestDTO } from '../../domain/inventory/dto/inventory.getbyuser.request.dto';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryUseCase: InventoryUseCase) {}

  @Get(':user_uuid')
  async getByUser(@Param('user_uuid') user_uuid: string) {
    return this.inventoryUseCase.getByUserUUID(user_uuid);
  }

  @Delete('delete')
  async delete(@Body() dto: InventoryGetByUserRequestDTO) {
    return this.inventoryUseCase.delete(dto.user_uuid);
  }
}
