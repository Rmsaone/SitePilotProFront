import type { BadgeColor } from '~/components/Tables/Types/api.interface';

/** Mirrors App\Enums\WorksitePriority. */
export enum WorksitePriorityEnum {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export const WorksitePriorityEnumMap = new Map<WorksitePriorityEnum, string>([
  [WorksitePriorityEnum.Low, 'Basse'],
  [WorksitePriorityEnum.Medium, 'Moyenne'],
  [WorksitePriorityEnum.High, 'Haute'],
  [WorksitePriorityEnum.Critical, 'Critique']
]);

export const WorksitePriorityColorMap: Record<WorksitePriorityEnum, BadgeColor> = {
  [WorksitePriorityEnum.Low]: 'success',
  [WorksitePriorityEnum.Medium]: 'warning',
  [WorksitePriorityEnum.High]: 'error',
  [WorksitePriorityEnum.Critical]: 'error'
};
