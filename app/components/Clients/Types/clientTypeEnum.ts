/** Mirrors App\Enums\ClientType. */
export enum ClientTypeEnum {
  Private = 'private',
  Pro = 'pro'
}

export const ClientTypeEnumMap = new Map<ClientTypeEnum, string>([
  [ClientTypeEnum.Private, 'Particulier'],
  [ClientTypeEnum.Pro, 'Professionnel']
]);
