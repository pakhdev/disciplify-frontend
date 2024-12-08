import { Category } from '../../interfaces/category.interface';
import { Task } from '../../interfaces/task.interface';

export interface DailyCategorizedTasks {
    category: Category;
    tasks: Task[];
}
