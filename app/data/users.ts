export interface UserInterface {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  userRole: string;
}

export const usersData: UserInterface[] = [
  {
    id: 1,
    first_name: 'Admin',
    last_name: 'SitePilot',
    phone: '0600000001',
    email: 'admin@sitepilotpro.fr',
    password: 'admin123',
    userRole: 'admin'
  },
  {
    id: 2,
    first_name: 'Jean',
    last_name: 'Dupont',
    phone: '0600000002',
    email: 'chef@sitepilotpro.fr',
    password: 'chef123',
    userRole: 'site_manager'
  }
];
