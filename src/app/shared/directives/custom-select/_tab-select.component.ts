import { Component, Input, Signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { SelectOption } from './interfaces/select-option.interface';

@Component({
    standalone: true,
    selector: 'tab-select',
    template: `
        <div [ngClass]="this.isMultiple ? 'input-option-selector--multi' : 'input-option-selector'">
            @for (option of options(); track option.element) {
                <div (click)="toggleOption(option.element)" [ngClass]="optionClass(option.element)">
                    <a>{{ option.text }}</a>
                </div>
            }
        </div>
    `,
    imports: [
        NgClass,
    ],
})
export class TabSelectComponent {
    @Input({ required: true }) isMultiple!: boolean;
    @Input({ required: true }) isReady!: Signal<boolean>;
    @Input({ required: true }) options!: Signal<SelectOption[]>;
    @Input({ required: true }) selectedOption!: Signal<string>;
    @Input({ required: true }) selectedOptions!: Signal<SelectOption[]>;
    @Input({ required: true }) availableOptions!: Signal<SelectOption[]>;
    @Input({ required: true }) selectOption!: (element: HTMLOptionElement) => void;
    @Input({ required: true }) unselectOption!: (element: HTMLOptionElement) => void;

    optionClass(element: HTMLOptionElement) {
        if (this.isOptionSelected(element)) {
            return this.isMultiple ? 'input-option-selector__selected--multi' : 'input-option-selector__selected';
        }
        return this.isMultiple ? 'input-option-selector__option--multi' : 'input-option-selector__option';
    }

    isOptionSelected(element: HTMLOptionElement): boolean {
        return this.selectedOptions().some((option) => option.element === element);
    }

    toggleOption(element: HTMLOptionElement): void {
        if (this.isOptionSelected(element)) {
            this.unselectOption(element);
        } else {
            this.selectOption(element);
        }
    }
}