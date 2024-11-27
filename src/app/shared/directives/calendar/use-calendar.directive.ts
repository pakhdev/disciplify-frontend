import {
    Directive,
    ElementRef,
    Renderer2,
    HostListener,
    ViewContainerRef,
    ComponentRef, Input,
} from '@angular/core';
import { CalendarComponent } from './_calendar.component';

@Directive({
    selector: '[use-calendar]',
    standalone: true,
})
export class UseCalendarDirective {

    @Input() public allowedDays: string[] = ['Mon', 'Tue', 'Wed', 'Thy', 'Fri', 'Sat', 'Sun'];
    private calendarRef!: ComponentRef<CalendarComponent> | null;
    private onMousedownHandler!: (event: MouseEvent) => void;

    private removeMousedownListener: (() => void) | null = null;

    constructor(
        private inputRef: ElementRef,
        private renderer: Renderer2,
        private viewContainerRef: ViewContainerRef,
    ) {}

    @HostListener('focus')
    showCalendar() {
        if (!this.calendarRef) {
            this.calendarRef = this.viewContainerRef.createComponent(CalendarComponent);
            this.calendarRef.setInput('dateInput', this.inputRef.nativeElement);
            this.calendarRef.setInput('allowedDays', this.#mapDaysToNumbers(this.allowedDays));
            this.calendarRef.setInput('closeCalendar', () => this.#closeCalendar());
            this.calendarRef.setInput('getParentElement', () => this.#getParentElement());

            const calendarElement = this.calendarRef.location.nativeElement;
            this.renderer.setStyle(this.#getParentElement(), 'position', 'relative');
            this.renderer.insertBefore(this.#getParentElement(), calendarElement, this.inputRef.nativeElement);
            this.#bindMousedownHandler();
        }
    }

    #closeCalendar(): void {
        this.calendarRef?.destroy();
        this.calendarRef = null;

        if (!this.removeMousedownListener) return;

        this.removeMousedownListener();
        this.removeMousedownListener = null;
    }

    #getParentElement(): HTMLElement {
        return this.inputRef.nativeElement.parentElement!;
    }

    #bindMousedownHandler() {
        this.removeMousedownListener = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
            if (!this.calendarRef) return;

            const calendarElement = this.calendarRef.location.nativeElement;
            const target = event.target as Node;

            if (target !== calendarElement && !calendarElement.contains(target))
                this.#closeCalendar();
        });
    }

    #mapDaysToNumbers(days: string[]): number[] {
        const dayMap: Record<string, number> = {
            'Tue': 0,
            'Wed': 1,
            'Thy': 2,
            'Fri': 3,
            'Sat': 4,
            'Sun': 5,
            'Mon': 6,
        };

        return days
            .map(day => dayMap[day])
            .filter((val): val is number => val !== undefined);
    }

}
