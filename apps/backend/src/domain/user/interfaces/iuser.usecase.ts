import { UserAddRequestDTO } from '../dto/user.add.request.dto';
import { UserUpdateRequestDTO } from '../dto/user.update.request.dto';
import { UserResponseDTO } from '../dto/user.response.dto';

export interface IUserUseCase {
  getList(): Promise<UserResponseDTO[]>;
  getByUUID(uuid: string): Promise<UserResponseDTO | null>;
  getByInternalId(id: number): Promise<UserResponseDTO | null>;
  add(entity: UserAddRequestDTO): Promise<UserResponseDTO>;
  delete(uuid: string): Promise<boolean>;
  update(entity: UserUpdateRequestDTO): Promise<UserResponseDTO>;
}
