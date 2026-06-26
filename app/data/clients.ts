import type { ClientInterface } from '~/components/Clients/Types/client.interface';

export const clientsData: ClientInterface[] = [
  {
    id: 1,
    contact_name: 'Jean Dupont',
    private_name: 'Dupont',
    email: 'societeA@societeA.fr',
    phone: '0601020304',
    company: 'Société A',
    clientType: 'pro'
  },
  {
    id: 2,
    contact_name: 'Pierre Martin',
    private_name: 'Martin',
    email: 'societeB@societeB.fr',
    phone: '0601020305',
    company: 'Société B',
    clientType: 'pro'
  },
  {
    id: 3,
    contact_name: 'Jacques Bernard',
    private_name: null,
    email: 'societeC@societeC.fr',
    phone: '0601020306',
    company: null,
    clientType: 'private'
  }
];
