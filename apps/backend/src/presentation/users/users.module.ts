import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserRepository } from '../../data/repository/user.repository';
import { InventoryRepository } from '../../data/repository/inventory.repository';
import { UserUseCase } from '../../domain/user/usecases/user.usecases';

@Module({
  controllers: [UsersController],
  providers: [UserRepository, InventoryRepository, UserUseCase],
})
export class UsersModule {}
