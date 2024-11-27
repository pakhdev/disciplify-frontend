import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    computed, effect, ElementRef,
    Input,
    OnInit, signal, ViewChild,
    WritableSignal,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { CustomSelectDirective } from '../custom-select/custom-select.directive';

@Component({
    standalone: true,
    selector: 'calendar',
    template: `
        <div [ngStyle]="{
                      top: calendarPosition.top + 'px',
                      left: calendarPosition.left + 'px'
                    }" class="calendar">
            <div class="calendar__header">Select a date</div>
            <div class="calendar__days">
                @for (row of daysList(); track row.rowNum) {
                    <div class="calendar__days-row">
                        @for (cell of row.cells; track cell.cellNum) {
                            @if (cell.isActive) {
                                <div (click)="setDate(cell.value)">{{ cell.value }}</div>
                            } @else {
                                <div class="calendar__disabled-day">{{ cell.value }}</div>
                            }
                        }
                    </div>
                }
            </div>
            <div class="calendar__toolbar">
                <select #monthSelect customSelect="dropdown" (change)="updatePeriod()">
                    @for (month of monthsList(); track month.value) {
                        <option value="{{ month.value }}">{{ month.name }}</option>
                    }
                </select>
                <select
                    #yearSelect
                    customSelect="dropdown"
                    (change)="updatePeriod()">
                    @for (year of yearsList; track year) {
                        <option value="{{ year }}">{{ year }}</option>
                    }
                </select>
            </div>
        </div>
    `,
    imports: [
        NgStyle,
        CustomSelectDirective,
    ],
})
export class CalendarComponent implements AfterViewInit {

    @Input() dateInput!: HTMLInputElement;
    @Input() allowedDays!: number[];
    @Input() closeCalendar!: () => void;
    @Input() getParentElement!: () => HTMLElement | null;
    @ViewChild('monthSelect') monthSelectRef!: ElementRef;
    @ViewChild('yearSelect') yearSelectRef!: ElementRef;

    public selectedPeriod: WritableSignal<{ month: number, year: number } | null> = signal(null);
    private readonly dayWeekNumber = [6, 0, 1, 2, 3, 4, 5];
    private months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    private currentYear: number = new Date().getFullYear();
    private currentMonth: number = new Date().getMonth();
    private showFutureYears = 1;

    public calendarPosition: { top: string; left: string } = { top: '0', left: '0' };
    private rightPadding = 10;

    constructor(private cdr: ChangeDetectorRef) {
        effect(() => {
            this.selectedPeriod();
            if (this.selectedPeriod()) {
                this.monthSelectRef.nativeElement.value = this.selectedPeriod()?.month;
                this.yearSelectRef.nativeElement.value = this.selectedPeriod()?.year;
            }
        });
    }

    ngAfterViewInit() {
        this.#getInputValue();
        this.calendarPosition = this.#calculateRightPosition();
        this.cdr.detectChanges();
    }

    get yearsList(): number[] {
        return Array.from({ length: this.showFutureYears + 1 }, (_, i) => this.currentYear + i);
    }

    monthsList = computed(() => {
        if (this.selectedPeriod() === null) return [];
        const months: { name: string, value: number }[] = [];
        const startFrom = this.selectedPeriod()?.year === this.currentYear ? this.currentMonth : 0;
        for (let i = startFrom; i < this.months.length; i++) {
            months.push({ name: this.months[i], value: i });
        }
        return months;
    });

    daysList = computed(() => {
        const selectedMonth = this.selectedPeriod()?.month;
        const selectedYear = this.selectedPeriod()?.year;

        if (selectedMonth === undefined || selectedYear === undefined) return [];
        const result: { rowNum: number, cells: { cellNum: number, value: string, isActive: boolean }[] }[] = [];
        let rowNum = 0;
        let cellNum = 0;

        const firstDay = this.dayWeekNumber[new Date(selectedYear, selectedMonth, 1).getDay()];
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

        // Today
        const dateToCompare = new Date(this.currentYear, this.currentMonth, new Date().getDate());
        dateToCompare.setHours(0, 0, 0, 0);

        let weekCellCounter = 0;
        let currentRow = [];

        // Empty cells before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            currentRow.push({ cellNum, value: '', isActive: false });
            cellNum++;
            weekCellCounter++;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            currentRow.push({
                cellNum,
                value: i.toString(),
                isActive: new Date(selectedYear, selectedMonth, i) >= dateToCompare && this.allowedDays.includes(this.dayWeekNumber[weekCellCounter]),
            });
            cellNum++;
            weekCellCounter++;

            if (weekCellCounter === 7) {
                result.push({ rowNum, cells: currentRow });
                currentRow = [];
                rowNum++;
                weekCellCounter = 0;
            }
        }

        // Empty cells after the last day of the month
        if (weekCellCounter > 0 && weekCellCounter < 7) {
            for (let i = weekCellCounter; i < 7; i++) {
                currentRow.push({ cellNum, value: '', isActive: false });
                cellNum++;
            }
        }

        result.push({ rowNum, cells: currentRow });
        return result;
    });

    setDate(day: string): void {
        const selectedMonth = this.selectedPeriod()?.month;
        const selectedYear = this.selectedPeriod()?.year;
        if (selectedMonth === undefined || selectedYear === undefined) return;
        this.dateInput.value = `${ String(day).padStart(2, '0') }/${ String(selectedMonth + 1).padStart(2, '0') }/${ selectedYear }`;
        this.dateInput.dispatchEvent(new Event('input'));
        this.closeCalendar();
    }

    updatePeriod(): void {
        const selectedMonth = +this.monthSelectRef.nativeElement.value;
        const selectedYear = +this.yearSelectRef.nativeElement.value;
        this.selectedPeriod.set({
            month: selectedYear === this.currentYear && selectedMonth < this.currentMonth ? this.currentMonth : selectedMonth,
            year: selectedYear,
        });
    }

    #getInputValue(): this {
        const inputValue = this.dateInput.value;
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (regex.test(inputValue)) {
            const [_, month, year] = inputValue.split('/');
            this.selectedPeriod.set({ month: parseInt(month) - 1, year: parseInt(year) });
        }
        return this;
    }

    #calculateRightPosition(): { top: string; left: string } {
        const inputRect = this.dateInput?.getBoundingClientRect();
        const parentRect = this.getParentElement()?.getBoundingClientRect();
        if (!inputRect || !parentRect) return { top: '0px', left: '0px' };

        return {
            top: `${ inputRect.top - parentRect.top }`,
            left: `${ inputRect.right - parentRect.left + this.rightPadding }`,
        };
    }
}
