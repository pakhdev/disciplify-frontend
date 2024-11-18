import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DynamicButtonTextDirective } from '../../../shared/directives/dynamic-button-text.directive';
import { ErrorMessageDirective } from '../../../shared/directives/error-message.directive';

@Component({
    standalone: true,
    selector: 'auth-login-page',
    templateUrl: './login-page.component.html',
    imports: [
        ErrorMessageDirective,
        FormsModule,
        ReactiveFormsModule,
        DynamicButtonTextDirective,
    ],
})
export class LoginPageComponent {

    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    public backendError: WritableSignal<string | null> = signal(null);
    public isLoading = signal(false);

    public loginForm = this.fb.group({
        name: ['',
            [Validators.required, Validators.minLength(3)],
        ],
        password: ['',
            [Validators.required, Validators.minLength(3)],
        ],
    });

    public login(): void {
        this.loginForm.markAllAsTouched();
        if (!this.loginForm.valid) return;
        const name: string = this.loginForm.value.name!.toString().trim();
        const password: string = this.loginForm.value.password!;
        this.isLoading.set(true);

        this.authService.login(name, password).subscribe({
            next: () => this.router.navigateByUrl('/dashboard'),
            error: errorCode => {
                this.backendError.set(errorCode);
                this.isLoading.set(false);
            },
        });
    }

    public hasError(field: string): boolean | null {
        return this.authService.hasError(this.loginForm, field);
    }

    public getError(field: string): ValidationErrors | null | undefined {
        return this.loginForm.get(field)?.errors;
    }
}
