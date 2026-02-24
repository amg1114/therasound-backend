export interface IJwtPayload {
  sub: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}
