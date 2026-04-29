import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../data/repository/user.repository';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { UserAddRequestDTO } from '../dto/user.add.request.dto';
import { UserUpdateRequestDTO } from '../dto/user.update.request.dto';
import { UserResponseDTO } from '../dto/user.response.dto';
import { IUserUseCase } from '../interfaces/iuser.usecase';
import { User } from '../user';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private inventoryRepository: InventoryRepository,
  ) {}

  async getList(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.getList();
    return users.map((u) => this.toResponseDTO(u));
  }

  async getByUUID(uuid: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.getByUUID(uuid);
    if (!user) return null;
    return this.toResponseDTO(user);
  }

  async getByInternalId(id: number): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.getById(id);
    if (!user) return null;
    return this.toResponseDTO(user);
  }

  async add(entity: UserAddRequestDTO): Promise<UserResponseDTO> {
    console.log('[DEBUG] UserUseCase.add called with:', entity.name, entity.email);
    const userEntity: Omit<User, 'id' | 'user_uuid'> = {
      name: entity.name,
      email: entity.email,
      password: entity.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userUuid = await this.userRepository.add(userEntity as any);
    console.log('[DEBUG] Created user with UUID:', userUuid);
    await this.inventoryRepository.add({ user_uuid: userUuid });
    console.log('[DEBUG] Created inventory for user:', userUuid);
    const user = await this.userRepository.getByUUID(userUuid);
    return this.toResponseDTO(user!);
  }

  async delete(uuid: string): Promise<boolean> {
    const user = await this.userRepository.getByUUID(uuid);
    if (!user) return false;
    const deleted = await this.userRepository.delete(uuid);
    if (deleted) {
      await this.inventoryRepository.delete(uuid);
    }
    return deleted > 0;
  }

  async update(entity: UserUpdateRequestDTO): Promise<UserResponseDTO> {
    const updatedEntity: Partial<User> = {
      name: entity.name,
      email: entity.email,
      updatedAt: new Date(),
    };
    await this.userRepository.update(entity.user_uuid, updatedEntity);
    const user = await this.userRepository.getByUUID(entity.user_uuid);
    return this.toResponseDTO(user!);
  }

  private toResponseDTO(user: User): UserResponseDTO {
    return {
      user_uuid: user.user_uuid,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
