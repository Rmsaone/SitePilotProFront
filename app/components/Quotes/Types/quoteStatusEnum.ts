import type { BadgeColor } from '~/components/Tables/Types/api.interface';

/** Mirrors App\Enums\QuoteStatus. */
export enum QuoteStatusEnum {
  Draft = 'draft',
  Send = 'send',
  Accept = 'accept',
  Decline = 'decline',
  Expire = 'expire'
}

export const QuoteStatusEnumMap = new Map<QuoteStatusEnum, string>([
  [QuoteStatusEnum.Draft, 'Brouillon'],
  [QuoteStatusEnum.Send, 'Envoyé'],
  [QuoteStatusEnum.Accept, 'Accepté'],
  [QuoteStatusEnum.Decline, 'Refusé'],
  [QuoteStatusEnum.Expire, 'Expiré']
]);

export const QuoteStatusColorMap: Record<QuoteStatusEnum, BadgeColor> = {
  [QuoteStatusEnum.Draft]: 'neutral',
  [QuoteStatusEnum.Send]: 'info',
  [QuoteStatusEnum.Accept]: 'success',
  [QuoteStatusEnum.Decline]: 'error',
  [QuoteStatusEnum.Expire]: 'warning'
};

/** App\Enums\TvaRate::numeric() */
export const TvaRateMap: Record<string, number> = {
  taux0: 0,
  taux2_1: 2.1,
  taux5_5: 5.5,
  taux10: 10,
  taux20: 20,
  intracom: 0,
  extracom: 0
};
