import {
    AfterViewInit,
    ComponentRef,
    Directive,
    ElementRef,
    Input,
    OnInit,
    Renderer2,
    ViewContainerRef,
    WritableSignal,
    computed,
    signal,
    Type, OnDestroy,
} from '@angular/core';
import { SelectOption } from './interfaces/select-option.interface';
import { DropdownSelectComponent } from './_dropdown-select.component';
import { TabSelectComponent } from './_tab-select.component';

type CustomSelectComponent = DropdownSelectComponent | TabSelectComponent;

@Directive({
    selector: '[customSelect]',
    standalone: true,
})
export class CustomSelectDirective implements AfterViewInit, OnInit, OnDestroy {

    @Input('customSelect') selectType!: 'dropdown' | 'tab';
    @Input() placeholder: string = 'Select an option';
    private customSelectRef!: ComponentRef<DropdownSelectComponent | TabSelectComponent>;

    private selectObserver!: MutationObserver;
    private options: WritableSignal<SelectOption[]> = signal([]);
    private readonly isMultiple: boolean;
    private isReady: WritableSignal<boolean> = signal(false);
    private isInternalChange: boolean = false;

    constructor(
        private selectElement: ElementRef<HTMLSelectElement>,
        private renderer: Renderer2,
        private viewContainerRef: ViewContainerRef,
    ) {
        this.isMultiple = this.selectElement.nativeElement.hasAttribute('multiple');
    }

    ngOnInit() {
        this
            .#hideOriginalSelect()
            .#createComponent()
            .#insertComponent();
    }

    ngAfterViewInit(): void {
        this
            .#initOptions()
            .#observeSelectChanges();
    }

    ngOnDestroy(): void {
        this.selectObserver.disconnect();
        this.selectElement.nativeElement.removeEventListener('change', this.#initOptions);
    }

    selectedOption = computed(() => {
        if (this.isMultiple)
            return this.placeholder;
        if (this.options().length === 0)
            return this.placeholder;
        return this.options().find((option) => option.selected)?.text || this.options()[0].text;
    });

    selectedOptions = computed(() => {
        return this.options().filter((option) => option.selected);
    });

    availableOptions = computed(() => {
        return this.options().filter((option) => !this.isMultiple || !option.selected);
    });

    selectOption(element: HTMLOptionElement): void {
        this.options.update(options => options.map(option => {
            if (!this.isMultiple && option.element !== element)
                return { ...option, selected: false };
            return option;
        }));
        this.#updateOption(element, { selected: true });
        element.selected = true;
        this.isInternalChange = true;
        this.#emitChangeEvent();
    }

    unselectOption(element: HTMLOptionElement): void {
        if (!this.isMultiple) return;
        this.#updateOption(element, { selected: false });
        element.selected = false;
        this.isInternalChange = true;
        this.#emitChangeEvent();
    }

    #emitChangeEvent() {
        const event = new Event('change', {
            bubbles: true,
            cancelable: true,
        });
        this.selectElement.nativeElement.dispatchEvent(event);
    }

    #addOptions(elements: HTMLOptionElement[], before: ChildNode | null): void {
        this.options.update(options => {
            if (before) {
                const index = options.findIndex(option => option.element === before);
                if (index !== -1) {
                    options.splice(index, 0, ...elements.map(element => ({
                        element,
                        text: element.innerText,
                        selected: element.selected,
                    })));
                }
            } else {
                options.push(...elements.map(element => ({
                    element,
                    text: element.innerText,
                    selected: element.selected,
                })));
            }
            return [...options];
        });
    }

    #updateOption(element: HTMLOptionElement, data: { text?: string, selected?: boolean }): void {
        this.options.update(options =>
            options.map(option =>
                option.element === element
                    ? {
                        ...option,
                        text: data.text !== undefined ? data.text : option.text,
                        selected: data.selected !== undefined ? data.selected : option.selected,
                    }
                    : option,
            ),
        );
    }

    #removeOption(element: HTMLOptionElement): void {
        this.options.update(options => options.filter(option => option.element !== element));
    }

    #findNextOptionElement(element: Node): ChildNode | null {
        const existingOptions = Array.from(this.selectElement.nativeElement.options);
        const referenceIdx = existingOptions.findIndex(optionElement => optionElement === element);
        if (referenceIdx === -1 || referenceIdx === existingOptions.length - 1)
            return null;
        return existingOptions[referenceIdx + 1] as ChildNode;
    }

    #observeSelectChanges(): this {
        this.selectObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'characterData' && mutation.oldValue) {
                    const optionElement = mutation.target.parentElement as HTMLOptionElement;
                    this.#updateOption(optionElement, { text: optionElement.innerText });
                }
                if (mutation.type === 'childList')
                    mutation.removedNodes.forEach((removedOption) => this.#removeOption(removedOption as HTMLOptionElement));
            });
            const optionsToAdd = mutations.flatMap(mutation => Array.from(mutation.addedNodes));
            if (optionsToAdd.length)
                this.#addOptions(optionsToAdd as HTMLOptionElement[], this.#findNextOptionElement(optionsToAdd[optionsToAdd.length - 1]));
        });
        this.selectObserver.observe(this.selectElement.nativeElement, {
            childList: true,
            characterData: true,
            subtree: true,
            characterDataOldValue: true,
        });

        this.selectElement.nativeElement.addEventListener('change', () => this.#initOptions());
        return this;
    }

    #initOptions(): this {
        if (this.isInternalChange) {
            this.isInternalChange = false;
        } else {
            setTimeout(() => {
                this.options.set(Array.from(this.selectElement.nativeElement.options).map((option) => {
                    return { element: option, text: option.text, selected: option.selected };
                }));
                this.#selectFirstOption();
                this.isReady.set(true);
            }, 0);
        }
        return this;
    }

    // Fix for the issue with automatic selection of the first option: for some reason, regular (non-multiple) selects without a
    // specified value are not selected in the browser. At the same time, their values are removed when binding forms in Angular.
    // This solution ensures the selection of the first item in non-multiple selects in both cases
    #selectFirstOption(): void {
        if (!this.isMultiple && !this.selectElement.nativeElement.value && this.selectElement.nativeElement.options.length > 0)
            this.selectOption(this.selectElement.nativeElement.options[0]);
    }

    #hideOriginalSelect(): this {
        this.renderer.setStyle(this.selectElement.nativeElement, 'display', 'none');
        return this;
    }

    #createComponent(): this {
        const component: Type<CustomSelectComponent> =
            this.selectType === 'dropdown'
                ? DropdownSelectComponent
                : TabSelectComponent;

        this.customSelectRef = this.viewContainerRef.createComponent(component);
        this.customSelectRef.setInput('isMultiple', this.isMultiple);
        this.customSelectRef.setInput('isReady', this.isReady);
        this.customSelectRef.setInput('options', this.options);
        this.customSelectRef.setInput('selectedOption', this.selectedOption);
        this.customSelectRef.setInput('selectedOptions', this.selectedOptions);
        this.customSelectRef.setInput('availableOptions', this.availableOptions);
        this.customSelectRef.setInput('selectOption', (element: HTMLOptionElement) =>
            this.selectOption(element),
        );

        this.customSelectRef.setInput('unselectOption', (element: HTMLOptionElement) =>
            this.unselectOption(element),
        );
        return this;
    }

    #insertComponent(): this {
        const selectElement = this.selectElement.nativeElement;
        const parentElement = this.selectElement.nativeElement.parentElement!;
        this.renderer.insertBefore(parentElement, this.customSelectRef.location.nativeElement, selectElement);
        return this;
    }
}
