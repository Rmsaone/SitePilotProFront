export enum UserRoleEnum {
  ADMIN = 'admin',
  USER = 'user',
  SITE_MANAGER = 'site_manager',
  SALES_REPRESENTATIVE = 'sales_representative',
  SITE_SUPERVISOR = 'site_supervisor'
}

export const UserRoleEnumMap = new Map<UserRoleEnum, string>([
  [UserRoleEnum.ADMIN, 'Administrateur'],
  [UserRoleEnum.USER, 'Utilisateur'],
  [UserRoleEnum.SITE_MANAGER, 'Chef de chantier'],
  [UserRoleEnum.SALES_REPRESENTATIVE, 'Commercial'],
  [UserRoleEnum.SITE_SUPERVISOR, 'Conducteur de travaux']
]);

export const UserRoleDescriptionMap = new Map<UserRoleEnum, string>([
  [UserRoleEnum.ADMIN, 'Accès complet'],
  [UserRoleEnum.USER, 'Accès limité'],
  [UserRoleEnum.SITE_MANAGER, 'Gestion des chantiers'],
  [UserRoleEnum.SALES_REPRESENTATIVE, 'Devis & clients'],
  [UserRoleEnum.SITE_SUPERVISOR, 'Suivi des travaux']
]);
