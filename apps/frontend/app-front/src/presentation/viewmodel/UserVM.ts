import { useState } from 'react';
import { User } from '../../domain/entities/user';
import { IUserUseCase } from '../../domain/interfaces/IUserUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';
import { useAuth } from '../context/AuthContext';

export const useUserVM = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const userUseCase = container.get<IUserUseCase>(TYPES.IUserUseCase);

  const user = authUser;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await userUseCase.login({ email, password });
      setAuthUser(result.user);
      return result.token;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData: { name: string; email: string; password: string }) => {
    const newUser = await userUseCase.post(userData);
    setAuthUser(newUser);
  };

  return { user, isLoading, login, registerUser };
};