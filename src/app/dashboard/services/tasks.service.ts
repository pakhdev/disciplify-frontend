import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { Task } from '../interfaces/task.interface';
import { DailyCategorizedTasks } from './interfaces/daily-categorized-tasks.interfaces';
import { TasksByTimeRange } from './interfaces/tasks-by-time-range.interface';
import { CreateTaskDto } from './interfaces/create-task.dto';
import { TimeRange } from './enums/time-range.enum';
import { Category } from '../interfaces/category.interface';

@Injectable({
    providedIn: 'root',
})
export class TasksService {

    private readonly http = inject(HttpClient);
    public tasks: WritableSignal<Task[]> = signal([]);
    public isLoading: WritableSignal<boolean> = signal(false);

    constructor() {
        this.fetchTasks();
    }

    get tasksByTimeRange(): TasksByTimeRange[] {
        return [
            {
                range: TimeRange.TODAY,
                tasks: this.filterByTimePeriod(0, 1),
            },
            {
                range: TimeRange.TOMORROW,
                tasks: this.filterByTimePeriod(1, 1),
            },
            {
                range: TimeRange.NEXT_7_DAYS,
                tasks: this.filterByTimePeriod(2, 5),
            },
            {
                range: TimeRange.NEXT_30_DAYS,
                tasks: this.filterByTimePeriod(7, 23),
            },
            {
                range: TimeRange.NOT_SOON,
                tasks: this.filterByTimePeriod(30),
            },
        ];
    }

    get dailyCategorizedTasks(): DailyCategorizedTasks[] {
        const result: DailyCategorizedTasks[] = [];
        this.filterByTimePeriod(0, 1).forEach((task: Task) => {
            task.categories.forEach((category: Category) => {
                const existingCategory = result.find((item) => item.category.id === category.id);
                if (existingCategory) {
                    existingCategory.tasks.push(task);
                } else {
                    result.push({
                        category,
                        tasks: [task],
                    });
                }
            });
        });
        return result;
    }

    public createTask(task: CreateTaskDto) {
        this.isLoading.set(true);
        this.http.post<Task>('/task', { ...task }).pipe(
            finalize(() => this.isLoading.set(false)),
        ).subscribe((newTask: Task) => {
            this.tasks.set([...this.tasks(), newTask]);
        });
    }

    private fetchTasks() {
        this.isLoading.set(true);
        this.http.get<Task[]>('/task')
            .pipe(
                finalize(() => this.isLoading.set(false)),
            ).subscribe((tasks: Task[]) => {
            this.tasks.set(tasks);
        });
    }

    private filterByTimePeriod(skip: number, take?: number): Task[] {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(today);
        startDate.setDate(today.getDate() + skip);

        const endDate = take ? new Date(today) : null;
        if (endDate && take) endDate.setDate(startDate.getDate() + take);

        return this.tasks().filter(task => {
            const taskDate = new Date(task.nextActivationAt).setHours(0, 0, 0, 1);
            if (endDate)
                return taskDate >= startDate.getTime() && taskDate <= endDate.getTime();
            return taskDate >= startDate.getTime();
        });
    }
}
