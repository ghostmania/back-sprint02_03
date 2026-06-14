export type EmailConfirmation = {
  confirmationCode: string;
  expirationDate: Date;
};

export type User = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailConfirmation: EmailConfirmation | null;
};
