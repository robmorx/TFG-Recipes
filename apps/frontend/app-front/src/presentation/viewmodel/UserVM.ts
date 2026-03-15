import { useState, useEffect } from 'react';
import { User } from '../../domain/entities/user';
import { IUserUseCase } from '../../domain/interfaces/IUserUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useUserVM = () => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const userUseCase = container.get<IUserUseCase>(TYPES.IUserUseCase);

  const loadUser = () => {
    setIsLoading(true);
    const data = userUseCase.get();
    setUser(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const registerUser = (user: User) => {
    userUseCase.post(user);
    loadUser();
  };

  return { user, isLoading, loadUser, registerUser };
};
