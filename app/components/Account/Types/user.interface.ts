import type { UserRoleEnum } from '~/components/Account/Types/userRoleEnum';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  affiliation_code: string | null;
  user_role: UserRoleEnum;
  user_role_title: string;
  created_at: string;
}

export interface UserResponse {
  data: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
