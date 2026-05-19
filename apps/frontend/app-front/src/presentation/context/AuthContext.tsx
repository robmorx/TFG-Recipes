import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../../domain/entities/user';
import { tokenStorageService } from '../../core/token-storage.service';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredSession = useCallback(async () => {
    try {
      const { accessToken, refreshToken } = await tokenStorageService.loadStoredTokens();
      
      if (accessToken && refreshToken) {
        const userRepository = container.get<IUserRepository>(TYPES.IUserRepository);
        try {
          const userData = await userRepository.get();
          if (userData) {
            setUser(userData);
          }
        } catch (error: any) {
          // Solo borrar tokens si el error indica específicamente que la sesión no es válida/expirada
          const isAuthError = 
            error.status === 401 || 
            error.status === 403 || 
            error.message?.includes('Sesión expirada') ||
            error.message?.includes('No autorizado');
          
          if (isAuthError) {
            await tokenStorageService.clearTokens();
          } else {
            console.warn('[AuthContext] Error de red o servidor al recuperar perfil (manteniendo sesión):', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredSession();
  }, [loadStoredSession]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const authRepository = container.get<IAuthRepository>(TYPES.IAuthRepository);
      const refreshToken = await tokenStorageService.getRefreshToken();
      
      if (refreshToken) {
        try {
          await authRepository.logout(refreshToken);
        } catch (error) {
          console.error('Error calling logout API:', error);
        }
      }
      
      await tokenStorageService.clearTokens();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
