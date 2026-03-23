import { User } from '../user/user';

export interface IUserRepository {
  getList(): Promise<User[]>;
  getByUUID(uuid: string): Promise<User | null>;
  add(entity: Omit<User, 'id'>): Promise<string>;
  delete(uuid: string): Promise<number>;
  update(uuid: string, entity: Partial<User>): Promise<number>;
}
