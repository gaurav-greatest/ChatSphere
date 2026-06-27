export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    displayName: string;
    avatar?: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
