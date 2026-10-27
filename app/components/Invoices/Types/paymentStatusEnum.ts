import type { BadgeColor } from '~/components/Tables/Types/api.interface';

/** Mirrors App\Enums\PaymentStatus. */
export enum PaymentStatusEnum {
  Pending = 'pending',
  Paid = 'paid',
  Partial = 'partial',
  Overdue = 'overdue',
  Canceled = 'canceled'
}

export const PaymentStatusEnumMap = new Map<PaymentStatusEnum, string>([
  [PaymentStatusEnum.Pending, 'Paiement en attente'],
  [PaymentStatusEnum.Paid, 'Paiement reçu'],
  [PaymentStatusEnum.Partial, 'Paiement partiel reçu'],
  [PaymentStatusEnum.Overdue, 'Paiement en retard'],
  [PaymentStatusEnum.Canceled, 'Paiement annulé']
]);

export const PaymentStatusColorMap: Record<PaymentStatusEnum, BadgeColor> = {
  [PaymentStatusEnum.Pending]: 'warning',
  [PaymentStatusEnum.Paid]: 'success',
  [PaymentStatusEnum.Partial]: 'info',
  [PaymentStatusEnum.Overdue]: 'error',
  [PaymentStatusEnum.Canceled]: 'neutral'
};
