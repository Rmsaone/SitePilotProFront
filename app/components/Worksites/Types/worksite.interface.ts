import type { ClientInterface } from '../../Clients/Types/client.interface';
import type { WorksitePriorityEnum, WorksiteStatusEnum } from './worksiteStatusEnum';

export interface WorksiteInterface {
  id: number;
  client: ClientInterface | null;
  name_worksite: string;
  start_date: string | null;
  end_date: string | null;
  worksite_priority: WorksitePriorityEnum | null;
  worksite_status: WorksiteStatusEnum;
  zip_code: number | null;
}
