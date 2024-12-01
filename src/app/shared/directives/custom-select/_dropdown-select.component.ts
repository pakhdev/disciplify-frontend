import { AfterViewInit, Component, effect, ElementRef, Input, OnDestroy, Signal, ViewChild } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { SelectOption } from './interfaces/select-option.interface';

@Component({
    standalone: true,
    selector: 'dropdown-select',
    styles: [':host { display: contents; }'],
    template: `
        <div class="input-multi-select" [ngStyle]="{ 'display': !isReady() ? 'none' : null }">
            @if (this.isMultiple) {
                @for (option of selectedOptions(); track option.element) {
                    <div (click)="unselectOption(option.element)" class="input-multi-select__selected">{{ option.text }}
                    </div>
                }
            }
            <div style="position: relative;">
                <div
                    #placeholderElement
                    [ngClass]="{ 'input-multi-select__add-button--active': this.isOpen }"
                    class="input-multi-select__add-button">{{ selectedOption() }}
                </div>
                <div
                    #dropdownElement
                    class="select-popup"
                    style="display: none; position: absolute;"
                    [ngStyle]="{
                      top: dropdownPosition.top + 'px',
                      left: dropdownPosition.left + 'px'
                    }">
                    @for (option of availableOptions(); track option.element) {
                        <a (click)="selectOption(option.element)">{{ option.text }}</a>
                    }
                </div>
            </div>
        </div>
    `,
    imports: [
        NgClass,
        NgStyle,
    ],
})
export class DropdownSelectComponent implements AfterViewInit, OnDestroy {
    @Input({ required: true }) isMultiple!: boolean;
    @Input({ required: true }) isReady!: Signal<boolean>;
    @Input({ required: true }) options!: Signal<SelectOption[]>;
    @Input({ required: true }) selectedOption!: Signal<string>;
    @Input({ required: true }) selectedOptions!: Signal<SelectOption[]>;
    @Input({ required: true }) availableOptions!: Signal<SelectOption[]>;
    @Input({ required: true }) selectOption!: (element: HTMLOptionElement) => void;
    @Input({ required: true }) unselectOption!: (element: HTMLOptionElement) => void;

    @ViewChild('dropdownElement') dropdownElement!: ElementRef<HTMLDivElement>;
    @ViewChild('placeholderElement') placeholderElement!: ElementRef<HTMLDivElement>;
    public dropdownPosition: { top: string; left: string } = { top: '0px', left: '0px' };
    public isOpen: boolean = false;
    private onMousedownHandler!: (event: MouseEvent) => void;

    constructor() {
        effect(() => {
            this.availableOptions();
            if (this.isOpen)
                this.toggleDropdown();
            setTimeout(() => this.#adjustElementsWidth(), 0);
        });
        this.#bindClickHandler();
    }

    ngAfterViewInit(): void {
        this.#calculateDropdownPosition();
    }

    ngOnDestroy(): void {
        document.removeEventListener('mousedown', this.onMousedownHandler);
    }

    toggleDropdown(): void {
        if (!this.isOpen && !this.availableOptions().length) return;
        this.isOpen = !this.isOpen;
        this.dropdownElement.nativeElement.style.display = this.isOpen ? 'block' : 'none';
    }

    #calculateDropdownPosition(): { top: string; left: string } {
        const selectRect = this.placeholderElement.nativeElement?.getBoundingClientRect();
        const parentRect = this.placeholderElement.nativeElement?.parentElement!.getBoundingClientRect();
        if (!selectRect || !parentRect) return { top: '0px', left: '0px' };
        return {
            top: `${ selectRect.bottom - parentRect.top }px`,
            left: `${ selectRect.left - parentRect.left }px`,
        };
    }

    #adjustElementsWidth(): void {
        const dropdown = this.dropdownElement?.nativeElement;
        const placeholder = this.placeholderElement?.nativeElement;
        if (!dropdown || !placeholder) return;

        const originalDisplay = dropdown.style.display;
        dropdown.style.visibility = 'hidden';
        dropdown.style.display = 'block';

        placeholder.style.removeProperty('width');
        dropdown.style.removeProperty('width');

        const maxWidth = Math.max(
            placeholder.getBoundingClientRect().width,
            dropdown.getBoundingClientRect().width,
        );

        dropdown.style.display = originalDisplay;
        dropdown.style.visibility = 'visible';

        placeholder.style.width = dropdown.style.width = `${ maxWidth }px`;
    }

    #bindClickHandler() {
        this.onMousedownHandler = (event) => {
            if (event.target === this.placeholderElement.nativeElement)
                this.toggleDropdown();
            else if (this.isOpen)
                this.#handleClickOutside(event);
        };
        document.addEventListener('mousedown', this.onMousedownHandler);
    }

    #handleClickOutside(event: MouseEvent) {
        const target = event.target as Node;
        if (target && !this.dropdownElement.nativeElement.contains(target)) {
            this.toggleDropdown();
        }
    }
}