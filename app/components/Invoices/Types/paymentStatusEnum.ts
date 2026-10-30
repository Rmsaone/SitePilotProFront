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

/** Payment received: date and method are required. */
export const RECEIVED_STATUSES = [PaymentStatusEnum.Paid, PaymentStatusEnum.Partial];

/** Mirrors App\Enums\PaymentMethod. */
export enum PaymentMethodEnum {
  BankTransfer = 'bank_transfer',
  Check = 'check',
  Cash = 'cash',
  CreditCard = 'credit_card',
  DirectDebit = 'direct_debit',
  Other = 'other'
}

export const PaymentMethodEnumMap = new Map<PaymentMethodEnum, string>([
  [PaymentMethodEnum.BankTransfer, 'Virement'],
  [PaymentMethodEnum.Check, 'Chèque'],
  [PaymentMethodEnum.Cash, 'Espèces'],
  [PaymentMethodEnum.CreditCard, 'Carte bancaire'],
  [PaymentMethodEnum.DirectDebit, 'Prélèvement'],
  [PaymentMethodEnum.Other, 'Autre']
]);

export const PaymentMethodIconMap: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.BankTransfer]: 'i-lucide-landmark',
  [PaymentMethodEnum.Check]: 'i-lucide-file-text',
  [PaymentMethodEnum.Cash]: 'i-lucide-banknote',
  [PaymentMethodEnum.CreditCard]: 'i-lucide-credit-card',
  [PaymentMethodEnum.DirectDebit]: 'i-lucide-repeat',
  [PaymentMethodEnum.Other]: 'i-lucide-circle-help'
};
