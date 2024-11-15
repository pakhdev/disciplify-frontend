import { Route, Routes } from '@angular/router';

import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const authRoutes: Routes = [{
    path: '',
    component: AuthLayoutComponent,
    children: [
        {
            path: 'login',
            loadComponent: () => import('./pages/login-page/login-page.component').then(c => c.LoginPageComponent),
        },
        {
            path: 'register',
            loadComponent: () => import('./pages/register-page/register-page.component').then(c => c.RegisterPageComponent),
        },
        { path: '**', redirectTo: 'login' },
    ],
}] as Route[];