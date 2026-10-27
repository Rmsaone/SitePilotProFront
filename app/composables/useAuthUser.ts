import type { User, UserResponse } from '~/components/Account/Types/user.interface';
import { UserRoleEnum } from '~/components/Account/Types/userRoleEnum';

/**
 * Typed access to the authenticated user.
 * The API wraps resources in `data`, so the raw sanctum identity is unwrapped here.
 */
export const useAuthUser = () => {
  const identity = useSanctumUser<UserResponse>();

  const user = computed<User | null>(() => identity.value?.data ?? null);

  const fullName = computed(() => user.value
    ? `${user.value.first_name} ${user.value.last_name}`
    : '');

  const initials = computed(() => user.value
    ? `${user.value.first_name.charAt(0)}${user.value.last_name.charAt(0)}`.toUpperCase()
    : '');

  const isAdmin = computed(() => user.value?.user_role === UserRoleEnum.ADMIN);

  function setUser(value: User | null): void {
    identity.value = value ? { data: value } : null;
  }

  return { user, fullName, initials, isAdmin, setUser };
};
