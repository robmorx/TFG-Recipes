export interface IAuthRepository {
  refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }>;
  logout(refreshToken?: string): Promise<{ message: string }>;
}
