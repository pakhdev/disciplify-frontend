import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { isFieldOneEqualFieldTwo } from '../../../shared/validators/validators';
import { NameValidator } from '../../../shared/validators/name-validator.service';
import { ErrorMessageDirective } from '../../../shared/directives/error-message.directive';
import { DynamicButtonTextDirective } from '../../../shared/directives/dynamic-button-text.directive';

@Component({
    standalone: true,
    selector: 'auth-register-page',
    templateUrl: './register-page.component.html',
    imports: [
        ReactiveFormsModule,
        FormsModule,
        ErrorMessageDirective,
        DynamicButtonTextDirective,
    ],
})
export class RegisterPageComponent {

    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly nameValidator = inject(NameValidator);
    private readonly authService = inject(AuthService);
    public backendError: WritableSignal<string | null> = signal(null);
    public isLoading = signal(false);

    public registerForm = this.fb.group({
        name: ['',
            [Validators.required, Validators.minLength(3)],
            [this.nameValidator],
        ],
        password: ['',
            [Validators.required, Validators.minLength(3)],
        ],
        repeatPassword: ['',
            [Validators.required, Validators.minLength(3)],
        ],
    }, {
        validators: [
            isFieldOneEqualFieldTwo('password', 'repeatPassword'),
        ],
    });

    public register(): void {
        this.registerForm.markAllAsTouched();
        if (!this.registerForm.valid) return;
        const name: string = this.registerForm.value.name!.toString().trim();
        const password: string = this.registerForm.value.password!;

        this.isLoading.set(true);
        this.authService.register(name, password).subscribe({
            next: () => this.router.navigateByUrl('/dashboard'),
            error: errorCode => {
                this.backendError.set(errorCode);
                this.isLoading.set(false);
            },
        });
    }

    public hasError(field: string): boolean | null {
        return this.authService.hasError(this.registerForm, field);
    }

    public getError(field: string): ValidationErrors | null | undefined {
        return this.registerForm.get(field)?.errors;
    }

}
