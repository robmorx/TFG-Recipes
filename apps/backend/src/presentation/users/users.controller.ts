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

  @Delete('delete')
  @ApiOperation({ summary: 'Delete user by UUID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async delete(@Param('user_uuid') user_uuid: string) {
    return this.userUseCase.delete(user_uuid);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(@Body() dto: UserUpdateRequestDTO) {
    return this.userUseCase.update(dto);
  }
}
