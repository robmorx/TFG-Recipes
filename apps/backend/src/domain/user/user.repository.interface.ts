import { User } from '../user/user';

export interface IUserRepository {
  getList(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  getByUUID(uuid: string): Promise<User | null>;
  add(entity: Omit<User, 'id'>): Promise<number>;
  delete(id: number): Promise<number>;
  update(id: number, entity: Partial<User>): Promise<number>;
}
