import type { BadgeColor } from '~/components/Tables/Types/api.interface';

export type { BadgeColor };

/** Mirrors App\Enums\WorksiteStatus. */
export enum WorksiteStatusEnum {
  Pending = 'pending',
  InProgress = 'in_progress',
  Paused = 'paused',
  Finished = 'finished',
  Canceled = 'canceled'
}

export const WorksiteStatusEnumMap = new Map<WorksiteStatusEnum, string>([
  [WorksiteStatusEnum.Pending, 'En attente'],
  [WorksiteStatusEnum.InProgress, 'En cours'],
  [WorksiteStatusEnum.Paused, 'Interruption'],
  [WorksiteStatusEnum.Finished, 'Terminé'],
  [WorksiteStatusEnum.Canceled, 'Annulé']
]);

export const WorksiteStatusColorMap: Record<WorksiteStatusEnum, BadgeColor> = {
  [WorksiteStatusEnum.Pending]: 'info',
  [WorksiteStatusEnum.InProgress]: 'warning',
  [WorksiteStatusEnum.Paused]: 'neutral',
  [WorksiteStatusEnum.Finished]: 'success',
  [WorksiteStatusEnum.Canceled]: 'error'
};
