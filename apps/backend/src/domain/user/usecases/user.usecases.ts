import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../data/repository/user.repository';
import { UserAddRequestDTO } from '../dto/user.add.request.dto';
import { UserUpdateRequestDTO } from '../dto/user.update.request.dto';
import { UserResponseDTO } from '../dto/user.response.dto';
import { IUserUseCase } from '../interfaces/iuser.usecase';
import { User } from '../user';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async getList(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.getList();
    return users.map((u) => this.toResponseDTO(u));
  }

  async getByUUID(uuid: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.getByUUID(uuid);
    if (!user) return null;
    return this.toResponseDTO(user);
  }

  async add(entity: UserAddRequestDTO): Promise<number> {
    const userEntity: Omit<User, 'id'> = {
      user_uuid: crypto.randomUUID(),
      email: entity.email,
      password: entity.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.userRepository.add(userEntity);
  }

  async delete(uuid: string): Promise<number> {
    const user = await this.userRepository.getByUUID(uuid);
    if (!user) return 0;
    return this.userRepository.delete(user.id);
  }

  async update(entity: UserUpdateRequestDTO): Promise<number> {
    const user = await this.userRepository.getByUUID(entity.user_uuid);
    if (!user) return 0;
    const updatedEntity: Partial<User> = {
      email: entity.email,
      updatedAt: new Date(),
    };
    return this.userRepository.update(user.id, updatedEntity);
  }

  private toResponseDTO(user: User): UserResponseDTO {
    return {
      user_uuid: user.user_uuid,
      email: user.email,
      atcreated: user.createdAt,
    };
  }
}