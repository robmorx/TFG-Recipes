import { UserAddRequestDTO } from '../dto/user.add.request.dto';
import { UserUpdateRequestDTO } from '../dto/user.update.request.dto';
import { UserResponseDTO } from '../dto/user.response.dto';

export interface IUserUseCase {
  getList(): Promise<UserResponseDTO[]>;
  getByUUID(uuid: string): Promise<UserResponseDTO | null>;
  add(entity: UserAddRequestDTO): Promise<string>;
  delete(uuid: string): Promise<number>;
  update(entity: UserUpdateRequestDTO): Promise<number>;
}
