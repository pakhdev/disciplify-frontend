import { TaskType } from '../../enums/task-type.enum';
import { RestrictedDaysPolicy } from '../../enums/restricted-days-policy.enum';

export interface CreateTaskDto {
    title: string;
    type: TaskType;
    isOptional: boolean;
    isRecurring: boolean;
    difficulty: number;
    iterationLimit: number;
    initAt: Date;
    repeatInterval: number;
    allowedDays: number;
    restricted_days_policy: RestrictedDaysPolicy;
    categoryIds: number[];
}