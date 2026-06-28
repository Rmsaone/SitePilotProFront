import { http, HttpResponse } from 'msw';
import { usersData } from '~/data/users';

export const authHandlers = [
  http.post('/api/v1/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };

    const found = usersData.find(u => u.email === email && u.password === password);

    if (!found) {
      return HttpResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const { password: _, ...user } = found;

    return HttpResponse.json({
      token: `mock_token_${user.id}`,
      user
    });
  }),

  http.post('/api/v1/logout', () => {
    return HttpResponse.json({ message: 'Déconnecté' });
  }),

  http.get('/api/v1/user', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) {
      return HttpResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const tokenId = auth.replace('Bearer mock_token_', '');
    const found = usersData.find(u => String(u.id) === tokenId);

    if (!found) {
      return HttpResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const { password: _, ...user } = found;
    return HttpResponse.json({ data: user });
  })
];
