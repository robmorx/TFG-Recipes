import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from '../../data/repository/user.repository';
import { UserUseCase } from '../../domain/user/usecases/user.usecases';

@Module({
  providers: [UsersService, UserRepository, UserUseCase],
  controllers: [UsersController],
})
export class UsersModule {}
