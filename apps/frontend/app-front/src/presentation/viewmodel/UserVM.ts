import { useState, useEffect } from 'react';
import { User } from '../../domain/entities/user';
import { IUserUseCase } from '../../domain/interfaces/IUserUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useUserVM = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userUseCase = container.get<IUserUseCase>(TYPES.IUserUseCase);

  const loadUser = async () => {
    setIsLoading(true);
    const data = await userUseCase.get();
    setUser(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const registerUser = async (user: { name: string; email: string; password: string }) => {
    await userUseCase.post(user);
    await loadUser();
  };

  return { user, isLoading, loadUser, registerUser };
};