import {
    Component,
    inject,
    computed, AfterViewInit, effect, OnInit,
} from '@angular/core';
import { UseCalendarDirective } from '../../../shared/directives/calendar/use-calendar.directive';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CategoriesService } from '../../services/categories.service';
import { CommonModule } from '@angular/common';
import { CustomSelectDirective } from '../../../shared/directives/custom-select/custom-select.directive';
import { isDateAllowed } from '../../../shared/validators/validators';
import { ErrorMessageDirective } from '../../../shared/directives/error-message.directive';
import { TasksService } from '../../services/tasks.service';

@Component({
    standalone: true,
    selector: 'dashboard-create-task',
    templateUrl: './create-task.component.html',
    imports: [
        CommonModule,
        UseCalendarDirective,
        ReactiveFormsModule,
        CustomSelectDirective,
        ErrorMessageDirective,
    ],
})
export class CreateTaskComponent implements OnInit {

    private readonly categoriesService = inject(CategoriesService);
    private readonly tasksService = inject(TasksService);
    private readonly fb = inject(FormBuilder);
    public newTaskForm!: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.newTaskForm = this.fb.group({
            title: ['', [Validators.required]],
            categoryIds: [null, [Validators.required]],
            scheduleFor: ['Today'],
            type: ['TO_DO'],
            difficulty: ['1'],
            iterationLimit: ['1'],
            isOptional: ['False'],
            initAt: [this.date.today, [Validators.pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/)]], //!
            repeatInterval: ['1', [Validators.required, Validators.min(1), Validators.max(365)]],
            allowedDays: [['Mon', 'Tue', 'Wed', 'Thy', 'Fri', 'Sat', 'Sun'], [Validators.required]],
            restrictedDaysPolicy: ['BEFORE'],
        }, {
            validators: [
                isDateAllowed('allowedDays', 'initAt'),
            ],
        });
    }

    ngOnInit() {
        this.#watchScheduleForChanges();
    }

    get initAt(): string {
        return this.newTaskForm?.get('initAt')?.value ?? '';
    }

    get allowedDays(): string[] {
        return this.newTaskForm?.get('allowedDays')?.value || [];
    }

    get date(): { today: string, tomorrow: string } {
        const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${ day }/${ month }/${ year }`;
        };

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        return {
            today: formatDate(today),
            tomorrow: formatDate(tomorrow),
        };
    }

    categories = computed(() => {
        return this.categoriesService.categories();
    });

    addTask() {
        const formValue = this.newTaskForm.value;
        formValue.isRecurring = formValue.scheduleFor === 'Recurring';
        delete formValue.scheduleFor;
        formValue.allowedDays = this.#encodeDays(formValue.allowedDays);
        formValue.difficulty = Number(formValue.difficulty);
        formValue.iterationLimit = Number(formValue.iterationLimit);
        formValue.repeatInterval = Number(formValue.repeatInterval);
        formValue.isOptional = formValue.isOptional.toLowerCase() === 'true';
        formValue.initAt = this.#encodeDate(formValue.initAt);
        this.tasksService.createTask(formValue);
        // reset the form
        // validate backend response?
    }

    public hasError(field: string): boolean {
        return (!!this.newTaskForm.controls[field].errors);
    }

    public getError(field: string): ValidationErrors | null | undefined {
        return this.newTaskForm.get(field)?.errors;
    }

    #watchScheduleForChanges(): void {
        this.newTaskForm.get('scheduleFor')?.valueChanges.subscribe(value => {
            if (value === 'Today')
                this.newTaskForm.get('initAt')?.setValue(this.date.today);
            else if (value === 'Tomorrow')
                this.newTaskForm.get('initAt')?.setValue(this.date.tomorrow);

            if (value !== 'Recurring') {
                this.newTaskForm.get('repeatInterval')?.setValue('1');
                this.newTaskForm.get('allowedDays')?.setValue(['Mon', 'Tue', 'Wed', 'Thy', 'Fri', 'Sat', 'Sun']);
            }
        });
    }

    #encodeDate(date: string): Date {
        const [day, month, year] = date.split('/');
        return new Date(`${ year }-${ month }-${ day }`);
    }

    #encodeDays(dayNames: string[]): number {
        const dayMap: Record<string, number> = {
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thy: 4,
            Fri: 5,
            Sat: 6,
            Sun: 7,
        };

        return dayNames.reduce((acc, name) => {
            const day = dayMap[name];
            if (day) {
                acc |= (1 << (day - 1));
            }
            return acc;
        }, 0);
    }

}
