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

/** Mirrors App\Enums\TvaRate (value → percentage). */
export enum TvaRateEnum {
  Taux0 = 'taux0',
  Taux2_1 = 'taux2_1',
  Taux5_5 = 'taux5_5',
  Taux10 = 'taux10',
  Taux20 = 'taux20',
  Intracom = 'intracom',
  Extracom = 'extracom'
}

export const TvaRateMap: Record<string, number> = {
  [TvaRateEnum.Taux0]: 0,
  [TvaRateEnum.Taux2_1]: 2.1,
  [TvaRateEnum.Taux5_5]: 5.5,
  [TvaRateEnum.Taux10]: 10,
  [TvaRateEnum.Taux20]: 20,
  [TvaRateEnum.Intracom]: 0,
  [TvaRateEnum.Extracom]: 0
};

export const TvaRateLabelMap = new Map<TvaRateEnum, string>([
  [TvaRateEnum.Taux20, 'TVA 20 % (taux normal)'],
  [TvaRateEnum.Taux10, 'TVA 10 % (rénovation)'],
  [TvaRateEnum.Taux5_5, 'TVA 5,5 % (amélioration énergétique)'],
  [TvaRateEnum.Taux2_1, 'TVA 2,1 %'],
  [TvaRateEnum.Taux0, 'Exonéré de TVA'],
  [TvaRateEnum.Intracom, 'TVA intracommunautaire'],
  [TvaRateEnum.Extracom, 'TVA extracommunautaire']
]);

/** Mirrors App\Enums\Unit. */
export enum UnitEnum {
  M2 = 'm2',
  Hour = 'hour',
  FlatRate = 'flat_rate',
  Ml = 'ml',
  Day = 'day',
  Unite = 'unite'
}

export const UnitShortLabelMap = new Map<UnitEnum, string>([
  [UnitEnum.M2, 'm²'],
  [UnitEnum.Hour, 'heure'],
  [UnitEnum.FlatRate, 'forfait'],
  [UnitEnum.Ml, 'ml'],
  [UnitEnum.Day, 'jour'],
  [UnitEnum.Unite, 'unité']
]);
