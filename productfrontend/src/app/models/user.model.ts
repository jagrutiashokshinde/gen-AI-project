export interface User {
  id?: number;
  username: string;
  email?: string;
  password?: string;
  roles?: Role[];
}

export interface Role {
  id?: number;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  roles: Role[];
}