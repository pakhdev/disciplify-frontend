import { Task } from '../../interfaces/task.interface';
import { TimeRange } from '../enums/time-range.enum';

export interface TasksByTimeRange {
    range: TimeRange;
    tasks: Task[];
}
