import type { WorksiteInterface } from '~/components/Worksites/Types/worksite.interface';
import { WorksitePriorityEnum, WorksiteStatusEnum } from '~/components/Worksites/Types/worksiteStatusEnum';

export const worksitesData: WorksiteInterface[] = [
  {
    id: 1,
    client: { id: 1, contact_name: 'Jean Dupont', private_name: 'Dupont', email: 'a@a.fr', phone: '0601020304', company: 'Société A', clientType: 'pro' },
    name_worksite: 'Chantier A',
    start_date: '2025-10-01',
    end_date: null,
    worksite_priority: WorksitePriorityEnum.High,
    worksite_status: WorksiteStatusEnum.InProgress,
    zip_code: 69001
  },
  {
    id: 2,
    client: { id: 2, contact_name: 'Pierre Martin', private_name: 'Martin', email: 'b@b.fr', phone: '0601020305', company: 'Société B', clientType: 'pro' },
    name_worksite: 'Chantier B',
    start_date: '2025-10-01',
    end_date: null,
    worksite_priority: WorksitePriorityEnum.Medium,
    worksite_status: WorksiteStatusEnum.InProgress,
    zip_code: 69002
  },
  {
    id: 3,
    client: { id: 1, contact_name: 'Jean Dupont', private_name: 'Dupont', email: 'a@a.fr', phone: '0601020304', company: 'Société A', clientType: 'pro' },
    name_worksite: 'Chantier C',
    start_date: '2025-10-01',
    end_date: '2026-10-01',
    worksite_priority: WorksitePriorityEnum.Low,
    worksite_status: WorksiteStatusEnum.Finished,
    zip_code: 69003
  },
  {
    id: 4,
    client: null,
    name_worksite: 'Chantier D',
    start_date: null,
    end_date: null,
    worksite_priority: null,
    worksite_status: WorksiteStatusEnum.Pending,
    zip_code: null
  },
  {
    id: 5,
    client: { id: 2, contact_name: 'Pierre Martin', private_name: 'Martin', email: 'b@b.fr', phone: '0601020305', company: 'Société B', clientType: 'pro' },
    name_worksite: 'Chantier E',
    start_date: '2024-10-01',
    end_date: null,
    worksite_priority: WorksitePriorityEnum.Critical,
    worksite_status: WorksiteStatusEnum.Paused,
    zip_code: 75001
  }
];
