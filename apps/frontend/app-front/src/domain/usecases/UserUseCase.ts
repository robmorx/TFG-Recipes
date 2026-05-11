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

  async login(
    credentials: { email: string; password: string },
    rememberMe: boolean,
  ): Promise<{ token: string; refreshToken: string; user: User }> {
    return this.userRepository.login(credentials, rememberMe);
  }

  async verifyAccount(email: string, code: string): Promise<{ message: string }> {
    return this.userRepository.verifyAccount(email, code);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.userRepository.forgotPassword(email);
  }

  async verifyResetCode(email: string, code: string): Promise<{ message: string }> {
    return this.userRepository.verifyResetCode(email, code);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return this.userRepository.resetPassword(email, code, newPassword);
  }
}