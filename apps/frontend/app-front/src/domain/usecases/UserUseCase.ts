import { inject, injectable } from 'inversify';
import { User } from '../entities/user';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUserUseCase } from '../interfaces/IUserUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class UserUseCase implements IUserUseCase {
  @inject(TYPES.IUserRepository)
  private userRepository!: IUserRepository;

  get(): User | undefined {
    return this.userRepository.get();
  }

  post(user: User): void {
    this.userRepository.post(user);
  }
}
