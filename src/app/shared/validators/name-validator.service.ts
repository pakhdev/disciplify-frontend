import { inject, Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, AsyncValidator } from '@angular/forms';
import { delay, Observable, of, switchMap, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { environments } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NameValidator implements AsyncValidator {

    private readonly http = inject(HttpClient);
    private isChecking = false;

    validate(control: AbstractControl): Observable<ValidationErrors | null> {
        const name = control.value;

        return of(control.value as string).pipe(
            delay(400),
            tap(() => this.isChecking = true),
            switchMap((name) => {

                const params = { name };
                return this.http.get<{
                    isRegistered: boolean
                }>(`${ environments.backendUrl }/auth/check-name`, { params }).pipe(
                    map((response) => {
                        if (response.isRegistered) {
                            return { nameTaken: true };
                        } else {
                            return null;
                        }
                    }),
                    catchError(() => of(null)),
                );

            }),
        );
    }

}