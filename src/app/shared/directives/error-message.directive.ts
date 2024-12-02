import { Directive, ElementRef, inject, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';

@Directive({
    standalone: true,
    selector: '[errorMessage]',
})
export class ErrorMessageDirective {

    private readonly htmlElement?: ElementRef<HTMLElement>;
    private readonly builder = inject(AnimationBuilder);
    private _errors?: ValidationErrors | null | undefined | string;
    private player: AnimationPlayer;

    @Input() set errors(value: ValidationErrors | null | undefined | string) {
        this._errors = value;
        this.setErrorMessage();
    }

    constructor(private element: ElementRef<HTMLElement>) {
        this.htmlElement = element;
        const factory = this.builder.build([
            style({ opacity: 0 }),
            animate('300ms ease-in', style({ opacity: 1 })),
        ]);
        this.player = factory.create(this.htmlElement.nativeElement);
        this.player.play();
    }

    setErrorMessage(): void {
        if (!this.htmlElement) return;
        if (!this._errors) {
            this.htmlElement.nativeElement.innerText = '';
            return;
        }

        const errors = typeof this._errors === 'string'
            ? this._errors
            : Object.keys(this._errors);

        if (errors.includes('required')) {
            this.htmlElement.nativeElement.innerText = 'This field is required';
            return;
        } else if (errors.includes('minlength') && typeof this._errors !== 'string') {
            const minLength = this._errors['minlength']['requiredLength'];
            this.htmlElement.nativeElement.innerText = `Minimum ${ minLength } characters`;
            return;
        } else if (errors.includes('notEqual')) {
            this.htmlElement.nativeElement.innerText = `Passwords do not match`;
            return;
        } else if (errors.includes('nameTaken')) {
            this.htmlElement.nativeElement.innerText = `This name is already registered`;
            return;
        } else if (errors.includes('userNotFound')) {
            this.htmlElement.nativeElement.innerText = `User does not exist`;
            return;
        } else if (errors.includes('wrongPassword')) {
            this.htmlElement.nativeElement.innerText = `Incorrect password`;
            return;
        } else if (errors.includes('wrongOldPassword')) {
            this.htmlElement.nativeElement.innerText = `Old password is incorrect`;
            return;
        } else if (errors.includes('passwordMatchesOld')) {
            this.htmlElement.nativeElement.innerText = `The new password matches the old one`;
            return;
        } else if (errors.includes('disallowedDaySelected')) {
            this.htmlElement.nativeElement.innerText = `Selected date is not allowed`;
            return;
        }
    }

}
