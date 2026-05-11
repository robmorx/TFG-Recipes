export interface RefreshToken {
  id: string;
  token_hash: string;
  user_uuid: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}
