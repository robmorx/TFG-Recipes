import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserRepository } from '../../data/repository/user.repository';
import { UserUseCase } from '../../domain/user/usecases/user.usecases';

@Module({
  controllers: [UsersController],
  providers: [UserRepository, UserUseCase],
})
export class UsersModule {}
