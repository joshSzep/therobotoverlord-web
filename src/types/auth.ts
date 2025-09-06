export interface User {
  user_id: string;
  username: string;
  email: string;
  role: string;
  loyalty_score: number;
  permissions: string[];
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  status: string;
  data: {
    authorization_url: string;
    state: string;
  };
}

export interface AuthResponse {
  status: string;
  data: User;
}

export interface RefreshResponse {
  status: string;
  data: {
    message: string;
  };
}

export interface LogoutResponse {
  status: string;
  data: {
    message: string;
  };
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface EmailAuthResponse {
  success: boolean;
  message: string;
  user?: User;
  access_token?: string;
  refresh_token?: string;
}
