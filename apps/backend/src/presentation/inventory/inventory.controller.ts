import { Controller, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InventoryUseCase } from '../../domain/inventory/usecases/inventory.usecases';
import { InventoryGetByUserRequestDTO } from '../../domain/inventory/dto/inventory.getbyuser.request.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryUseCase: InventoryUseCase) {}

  @Get(':user_uuid')
  @ApiOperation({ summary: 'Get inventory by user UUID' })
  @ApiParam({ name: 'user_uuid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User inventory with items' })
  async getByUserUUID(@Param('user_uuid') user_uuid: string) {
    return this.inventoryUseCase.getByUserUUID(user_uuid);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete inventory by user UUID' })
  @ApiResponse({ status: 200, description: 'Inventory deleted' })
  async delete(@Body() dto: InventoryGetByUserRequestDTO) {
    return this.inventoryUseCase.delete(dto.user_uuid);
  }
}