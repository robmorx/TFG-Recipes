import { inject, injectable } from 'inversify';
import { User } from '../entities/user';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUserUseCase } from '../interfaces/IUserUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class UserUseCase implements IUserUseCase {
  private userRepository: IUserRepository
    constructor(
        @inject(TYPES.IUserRepository)
        userRepository: IUserRepository
      ) {
        this.userRepository = userRepository
      }

  get(): User | undefined {
    return this.userRepository.get();
  }

  post(user: User): void {
    this.userRepository.post(user);
  }
}