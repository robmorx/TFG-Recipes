import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserUseCase } from '../../domain/user/usecases/user.usecases';
import { UserAddRequestDTO } from '../../domain/user/dto/user.add.request.dto';
import { UserDeleteRequestDTO } from '../../domain/user/dto/user.delete.request.dto';
import { UserUpdateRequestDTO } from '../../domain/user/dto/user.update.request.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getList() {
    return this.userUseCase.getList();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@CurrentUser() user: { user_uuid: string }) {
    return this.userUseCase.getByUUID(user.user_uuid);
  }

  @Get(':user_uuid')
  @ApiOperation({ summary: 'Get user by UUID' })
  @ApiParam({ name: 'user_uuid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found' })
  async getUser(@Param('user_uuid') user_uuid: string) {
    return this.userUseCase.getByUUID(user_uuid);
  }

  @Post('add')
  @Public()
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async add(@Body() dto: UserAddRequestDTO) {
    return this.userUseCase.add(dto);
  }

 @Delete('delete/:user_uuid') 
  @ApiOperation({ summary: 'Eliminar usuario por UUID' })
  @ApiParam({ 
    name: 'user_uuid', 
    description: 'El identificador único (UUID) del usuario a eliminar',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  async delete(@Param('user_uuid') user_uuid: string) {
    console.log('Eliminando usuario con UUID:', user_uuid);
    return this.userUseCase.delete(user_uuid);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(@Body() dto: UserUpdateRequestDTO) {
    return this.userUseCase.update(dto);
  }
}
