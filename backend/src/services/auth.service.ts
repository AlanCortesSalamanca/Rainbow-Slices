import type { User } from '@supabase/supabase-js';

export class AuthService {
  getMe(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role ?? user.app_metadata?.role ?? null,
      name: user.user_metadata?.name ?? null
    };
  }
}

export const authService = new AuthService();
