import { Controller, Get, Post, Delete, Put, Body, Param } from '@nestjs/common';
import { UserUseCase } from '../../domain/user/usecases/user.usecases';
import { UserAddRequestDTO } from '../../domain/user/dto/user.add.request.dto';
import { UserDeleteRequestDTO } from '../../domain/user/dto/user.delete.request.dto';
import { UserUpdateRequestDTO } from '../../domain/user/dto/user.update.request.dto';

@Controller('/users')
export class UsersController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get()
  async getList() {
    return this.userUseCase.getList();
  }

  @Get(':user_uuid')
  async getUser(@Param('user_uuid') user_uuid: string) {
    return this.userUseCase.getByUUID(user_uuid);
  }

  @Post('add')
  async add(@Body() dto: UserAddRequestDTO) {
    return this.userUseCase.add(dto);
  }

  @Delete('delete')
  async delete(@Body() dto: UserDeleteRequestDTO) {
    return this.userUseCase.delete(dto.user_uuid);
  }

  @Put('update')
  async update(@Body() dto: UserUpdateRequestDTO) {
    return this.userUseCase.update(dto);
  }
}
