import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    this.dailyRecipeLimit = configService.get<number>('DAILY_RECIPE_LIMIT', 2);
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
    const userEntity = {
      name: entity.name,
      email: entity.email,
      password: entity.password,
      isVerified: false,
      verificationCode: null as string | null,
      verificationCodeExpires: null as Date | null,
      resetPasswordCode: null as string | null,
      resetPasswordCodeExpires: null as Date | null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userUuid = await this.userRepository.add(userEntity as any);
    await this.inventoryRepository.add({ user_uuid: userUuid });

    const code = this.generateVerificationCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    await this.userRepository.updateVerificationCode(userUuid, code, expires);

    await this.mailService.sendVerificationCode(entity.email, code);

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
