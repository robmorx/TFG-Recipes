import { User } from '../user/user';

export interface IUserRepository {
  getList(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  getByUUID(uuid: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  add(entity: Omit<User, 'id'>): Promise<string>;
  delete(uuid: string): Promise<number>;
  update(uuid: string, entity: Partial<User>): Promise<number>;
  validatePassword(user: User, password: string): Promise<boolean>;
  updatePassword(uuid: string, hashedPassword: string): Promise<void>;
  updateVerificationCode(
    uuid: string,
    code: string,
    expires: Date,
  ): Promise<void>;
  verifyUser(uuid: string): Promise<void>;
  updateResetPasswordCode(
    uuid: string,
    code: string,
    expires: Date,
  ): Promise<void>;
  clearResetPasswordCode(uuid: string): Promise<void>;
}
