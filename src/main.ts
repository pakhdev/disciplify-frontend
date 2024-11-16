import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { AuthorizationInterceptor } from './app/shared/interceptors/authorization.interceptor';
import { routes } from './app/routes';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideAnimations(),
        provideHttpClient(
            withInterceptors([AuthorizationInterceptor]),
        ),
    ],
})
  .catch((err) => console.error(err));
