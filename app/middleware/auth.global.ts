export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('auth_token');

  const publicRoutes = ['/login'];

  if (!token.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  if (token.value && to.path === '/login') {
    return navigateTo('/');
  }
});
