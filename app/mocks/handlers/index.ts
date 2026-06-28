import { authHandlers } from './auth';
import { clientHandlers } from './clients';
import { worksiteHandlers } from './worksites';

export const handlers = [
  ...authHandlers,
  ...clientHandlers,
  ...worksiteHandlers
];
