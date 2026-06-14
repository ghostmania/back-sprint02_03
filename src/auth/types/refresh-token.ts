export type RefreshToken = {
  userId: string;
  token: string;
  isRevoked: boolean;
  createdAt: Date;
  expiresAt: Date;
};
