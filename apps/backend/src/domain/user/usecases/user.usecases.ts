import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { UserRepository } from '../../../data/repository/user.repository';
import { RecipeRepository } from '../../../data/repository/recipe.repository';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { MailService } from '../../../mail/mail.service';
import { UserAddRequestDTO } from '../dto/user.add.request.dto';
import { UserUpdateRequestDTO } from '../dto/user.update.request.dto';
import { UserResponseDTO } from '../dto/user.response.dto';
import { IUserUseCase } from '../interfaces/iuser.usecase';
import { User } from '../user';

@Injectable()
export class UserUseCase implements IUserUseCase {
  private readonly dailyRecipeLimit: number;

  constructor(
    private userRepository: UserRepository,
    private recipeRepository: RecipeRepository,
    private inventoryRepository: InventoryRepository,
    private mailService: MailService,
    configService: ConfigService,
  ) {
    this.dailyRecipeLimit = parseInt(configService.get('DAILY_RECIPE_LIMIT', '2')?.toString() || '2', 10);
  }

  async getList(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.getList();
    const results: UserResponseDTO[] = [];
    for (const u of users) {
      results.push(await this.toResponseDTO(u));
    }
    return results;
  }

  async getByUUID(uuid: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.getByUUID(uuid);
    if (!user) return null;
    return this.toResponseDTO(user);
  }

  async add(entity: UserAddRequestDTO): Promise<UserResponseDTO> {
    try {
      const userEntity = {
        name: entity.name,
        email: entity.email,
        password: entity.password,
        isVerified: true,
        verificationCode: null as string | null,
        verificationCodeExpires: null as Date | null,
        resetPasswordCode: null as string | null,
        resetPasswordCodeExpires: null as Date | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userUuid = await this.userRepository.add(userEntity as any);
      await this.inventoryRepository.add({ user_uuid: userUuid });

      const user = await this.userRepository.getByUUID(userUuid);
      return this.toResponseDTO(user!);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe una cuenta con este correo electrónico');
      }
      throw error;
    }
  }

  async delete(uuid: string): Promise<boolean> {
    console.log('usecase');
    const user = await this.userRepository.getByUUID(uuid);
    console.log(user);
    if (!user) return false;
    if (user) {
      
      await this.inventoryRepository.delete(uuid);
    }
    const deleted = await this.userRepository.delete(uuid);
    
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

  private async toResponseDTO(user: User): Promise<UserResponseDTO> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyRecipeCount = await this.recipeRepository.countByUserSince(user.user_uuid, today);
    return {
      user_uuid: user.user_uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      dailyRecipeCount,
      dailyRecipeLimit: this.dailyRecipeLimit,
      createdAt: user.createdAt,
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
