import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { reducers } from './store';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AuthInterceptor } from './auth.interceptor';

// Sovelluksen konfiguraatio, joka määrittelee reitityksen, tilanhallinnan ja pyyntöjen käsittelyn
export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideStore(reducers),
		provideHttpClient(withInterceptorsFromDi()),
		provideEffects(),
		provideStoreDevtools({ maxAge: 25, logOnly: isDevMode() }),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
	],
};
