export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LoginErrorResponse {
  message: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  inviteToken?: string;
}
