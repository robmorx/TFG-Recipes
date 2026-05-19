import { useState } from 'react';
import { User } from '../../domain/entities/user';
import { IUserUseCase } from '../../domain/interfaces/IUserUseCase';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';
import { useAuth } from '../context/AuthContext';

export const useUserVM = () => {
  const { user: authUser, setUser: setAuthUser, logout: logoutFromContext, isLoading: authIsLoading } = useAuth();
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

  const logout = async () => {
    await logoutFromContext();
  };

  const registerUser = async (userData: { name: string; email: string; password: string }) => {
    await userUseCase.post(userData);
  };

  const verifyAccount = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      return await userUseCase.verifyAccount(email, code);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      return await userUseCase.forgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      return await userUseCase.verifyResetCode(email, code);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      return await userUseCase.resetPassword(email, code, newPassword);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    user, 
    isLoading: isLoading || authIsLoading, 
    login, 
    logout,
    registerUser, 
    verifyAccount, 
    forgotPassword, 
    verifyResetCode, 
    resetPassword 
  };
};