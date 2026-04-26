import { inject, injectable } from 'inversify';
import { User } from '../entities/user';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUserUseCase } from '../interfaces/IUserUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class UserUseCase implements IUserUseCase {
  private userRepository: IUserRepository;
  constructor(
      @inject(TYPES.IUserRepository)
      userRepository: IUserRepository
    ) {
      this.userRepository = userRepository;
    }

  async get(): Promise<User | null> {
    return this.userRepository.get();
  }

  async post(user: { name: string; email: string; password: string }): Promise<User> {
    return this.userRepository.post(user);
  }
}