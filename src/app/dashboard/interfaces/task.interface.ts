import { TaskType } from '../enums/task-type.enum';
import { Category } from './category.interface';
import { RestrictedDaysPolicy } from '../enums/restricted-days-policy.enum';

export interface Task {
    title: string;
    type: TaskType;
    isOptional: boolean;
    isRecurring: boolean;
    difficulty: number;
    iterationCount: number;
    iterationLimit: number;
    currentScore: number;
    maxScore: number;
    initAt: Date;
    nextActivationAt: Date;
    repeatInterval: number;
    allowedDays: number;
    restricted_days_policy: RestrictedDaysPolicy;
    finished: boolean;
    categories: Category[];
}
