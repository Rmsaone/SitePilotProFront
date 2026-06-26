import { http, HttpResponse } from 'msw';
import { worksitesData } from '~/data/worksite';

export const worksiteHandlers = [
  http.get('/api/v1/worksites', () => {
    return HttpResponse.json({
      data: worksitesData,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: worksitesData.length
      }
    });
  }),

  http.get('/api/v1/worksites/:worksite_id', ({ params }) => {
    const found = worksitesData.find(w => w.id === Number(params.worksite_id));
    if (!found) {
      return HttpResponse.json({ message: 'Chantier introuvable' }, { status: 404 });
    }
    return HttpResponse.json({ data: found });
  })
];
