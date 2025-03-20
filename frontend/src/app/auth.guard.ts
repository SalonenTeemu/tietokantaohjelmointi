import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { NotificationService } from './services/notification.service';
import { Store } from '@ngrx/store';
import { selectIsLoadingUser, selectUser } from './store/selectors/auth.selector';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(
		private store: Store,
		private router: Router,
		private notificationService: NotificationService
	) {}

	canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		const requiredRoles = route.data['roles'] as string[];
		console.log('isloadinguser', this.store.select(selectIsLoadingUser).pipe(take(1)));

		return this.store.select(selectIsLoadingUser).pipe(
			filter((loading) => !loading),
			switchMap(() =>
				this.store.select(selectUser).pipe(
					take(1),
					map((user) => {
						if (user && user.rooli && requiredRoles.includes(user.rooli)) {
							return true;
						}
						this.notificationService.newNotification('error', 'Ei oikeuksia sivulle.');
						this.router.navigate(['/']);
						return false;
					}),
					catchError(() => {
						this.notificationService.newNotification('error', 'Ei oikeuksia sivulle.');
						this.router.navigate(['/']);
						return of(false);
					})
				)
			)
		);
	}
}
