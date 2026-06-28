export enum WorksiteStatusEnum {
  Pending = 'pending',
  Paused = 'paused',
  InProgress = 'in_progress',
  Finished = 'finished',
  Canceled = 'canceled'
}

export const WorksiteStatusEnumMap = new Map<WorksiteStatusEnum, string>([
  [WorksiteStatusEnum.Pending, 'En attente'],
  [WorksiteStatusEnum.Paused, 'Interruption'],
  [WorksiteStatusEnum.InProgress, 'En cours'],
  [WorksiteStatusEnum.Finished, 'Terminé'],
  [WorksiteStatusEnum.Canceled, 'Annulé']
]);

export enum WorksitePriorityEnum {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export type BadgeColor
  = 'neutral'
    | 'error'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning';

export const WorksiteStatusColorMap: Record<WorksiteStatusEnum, BadgeColor> = {
  [WorksiteStatusEnum.Pending]: 'neutral',
  [WorksiteStatusEnum.Paused]: 'warning',
  [WorksiteStatusEnum.InProgress]: 'info',
  [WorksiteStatusEnum.Finished]: 'success',
  [WorksiteStatusEnum.Canceled]: 'error'
};
