import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { interval, Observable, Subscription, take } from 'rxjs';
import { AuthService } from './services/auth.service';
import { BookService } from './services/book.service';
import { selectIsLoggedIn, selectUserRole } from './store/selectors/auth.selector';
import { addLuokat, addTyypit } from './store/actions/category.actions';
import { NotificationService } from './services/notification.service';
import { NotificationComponent } from './notification.component';
import { map } from 'rxjs/operators';
import { selectCartItems } from './store/selectors/cart.selector';
import { TimerService } from './services/timer.service';
import { AikaPipe } from './pipes/aika.pipe';

@Component({
	selector: 'app-root',
	standalone: true,
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	imports: [RouterModule, CommonModule, NotificationComponent, AikaPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
// Pääkomponentti, joka sisältää sovelluksen navigaation ja tilan hallinnan
export class AppComponent implements OnInit, OnDestroy {
	private tokenRefreshSubscription!: Subscription;
	kirjautunut$: Observable<boolean>;
	rooli$: Observable<string | undefined>;
	timer$: Observable<number>;
	ostoskoriCount$: Observable<number>;

	// Rakentaja alustaa käyttäjän ja roolin tilat storesta sekä palvelut
	constructor(
		private store: Store,
		private authService: AuthService,
		private bookService: BookService,
		private notificationService: NotificationService,
		private timerService: TimerService,
		private cdr: ChangeDetectorRef
	) {
		this.kirjautunut$ = this.store.select(selectIsLoggedIn);
		this.rooli$ = this.store.select(selectUserRole) || undefined;
		this.timer$ = this.timerService.getCountdown();
		this.ostoskoriCount$ = this.store.select(selectCartItems).pipe(map((items) => items.length));
	}

	// Komponentti alustuu ja lataa luokat, tyypit sekä käyttäjän tiedot ja asettaa aikavälin tokenien päivitykselle
	ngOnInit() {
		this.authService.getKayttaja().subscribe();
		this.bookService.getTeosLuokat().subscribe((luokat: string[]) => {
			this.store.dispatch(addLuokat({ luokat }));
		});
		this.bookService.getTeosTyypit().subscribe((tyypit: string[]) => {
			this.store.dispatch(addTyypit({ tyypit }));
		});
		this.kirjautunut$.pipe(take(1)).subscribe((isLoggedIn) => {
			if (!isLoggedIn) {
				this.authService.paivitaTokenit().subscribe({
					next: (success) => {
						if (!success) {
							this.authService.postKirjauduUlos().subscribe();
						}
					},
					error: () => {
						this.authService.postKirjauduUlos().subscribe();
					},
				});
			}
		});
		this.tokenRefreshSubscription = interval(840000).subscribe(() => {
			this.kirjautunut$.subscribe((isLoggedIn) => {
				// Jos käyttäjä on kirjautunut sisään, päivitetään tokenit
				if (isLoggedIn) {
					this.authService.paivitaTokenit().subscribe({
						next: (success) => {
							if (!success) {
								this.authService.postKirjauduUlos().subscribe();
								this.notificationService.newNotification('error', 'Istuntosi on vanhentunut. Kirjaudu uudelleen sisään.');
							}
						},
						error: (err) => {
							console.error('Virhe tokenien päivityksessä:', err);
							this.authService.postKirjauduUlos().subscribe();
							this.notificationService.newNotification('error', 'Istuntosi on vanhentunut. Kirjaudu uudelleen sisään.');
						},
					});
				}
			});
		});

		this.timer$.subscribe(() => {
			this.cdr.markForCheck();
		});

		this.ostoskoriCount$.subscribe((count) => {
			if (count > 0) {
				this.timerService.start();
			} else {
				this.timerService.clear();
			}
		});
	}

	ngOnDestroy() {
		if (this.tokenRefreshSubscription) {
			this.tokenRefreshSubscription.unsubscribe();
		}
	}

	// Kirjaa käyttäjän ulos ja näyttää ilmoituksen
	kirjauduUlos() {
		this.authService.postKirjauduUlos().subscribe();
		this.notificationService.newNotification('success', 'Kirjauduttu ulos');
	}
}
