import { http, HttpResponse } from 'msw';
import { clientsData } from '~/data/clients';

export const clientHandlers = [
  http.get('/api/v1/clients', () => {
    return HttpResponse.json({
      data: clientsData,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: clientsData.length
      }
    });
  }),

  http.get('/api/v1/clients/:client_id', ({ params }) => {
    const found = clientsData.find(c => c.id === Number(params.client_id));
    if (!found) {
      return HttpResponse.json({ message: 'Client introuvable' }, { status: 404 });
    }
    return HttpResponse.json({ data: found });
  })
];
