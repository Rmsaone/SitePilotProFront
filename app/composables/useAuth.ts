import type { UserInterface } from '~/data/users';

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', { default: () => null });
  const user = useState<Omit<UserInterface, 'password'> | null>('auth_user', () => null);

  const isLoggedIn = computed(() => !!token.value);

  // TODO: brancher sur POST /api/v1/login (MSW intercepte en dev)
  async function login(email: string, password: string): Promise<void> {
    const data = await $fetch<{ token: string; user: Omit<UserInterface, 'password'> }>(
      '/api/v1/login',
      { method: 'POST', body: { email, password } }
    );
    token.value = data.token;
    user.value = data.user;
  }

  // TODO: brancher sur POST /api/v1/logout
  async function logout(): Promise<void> {
    await $fetch('/api/v1/logout', {
      method: 'POST',
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
    }).catch(() => {});
    token.value = null;
    user.value = null;
    await navigateTo('/login');
  }

  // TODO: brancher sur GET /api/v1/user
  async function fetchUser(): Promise<void> {
    if (!token.value) return;
    try {
      const data = await $fetch<{ data: Omit<UserInterface, 'password'> }>(
        '/api/v1/user',
        { headers: { Authorization: `Bearer ${token.value}` } }
      );
      user.value = data.data;
    } catch {
      token.value = null;
      user.value = null;
    }
  }

  return { token, user, isLoggedIn, login, logout, fetchUser };
};
