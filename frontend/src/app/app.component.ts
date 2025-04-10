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
import { clearCart } from './store/actions/cart.actions';

@Component({
	selector: 'app-root',
	standalone: true,
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	imports: [RouterModule, CommonModule, NotificationComponent, AikaPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
// Sovellusksen pääkomponentti, joka hallitsee käyttäjän kirjautumista ja ostoskorin ajastusta
export class AppComponent implements OnInit, OnDestroy {
	private tokenRefreshSubscription!: Subscription;
	kirjautunut$: Observable<boolean>;
	rooli$: Observable<string | undefined>;
	timer$: Observable<number>;
	ostoskoriCount$: Observable<number>;

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

	ngOnInit() {
		// Hae käyttäjätiedot ja teosten luokat ja tyypit alussa
		this.authService.getKayttaja().subscribe();
		this.bookService.getTeosLuokat().subscribe((luokat: string[]) => {
			this.store.dispatch(addLuokat({ luokat }));
		});
		this.bookService.getTeosTyypit().subscribe((tyypit: string[]) => {
			this.store.dispatch(addTyypit({ tyypit }));
		});

		// Tarkista, onko käyttäjä kirjautunut sisään ja päivitä tokenit tarvittaessa
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

		// Käynnistä ajstin tokenin päivitykselle
		this.tokenRefreshSubscription = interval(840000).subscribe(() => {
			this.kirjautunut$.subscribe((isLoggedIn) => {
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

		// Tarkista ajastimen tila ja tyhjennä ostoskori tarvittaessa
		this.timer$.subscribe(() => {
			this.cdr.markForCheck();
			const aika = localStorage.getItem('ajastinAlkuAika');
			const nyt = Date.now();
			if (aika && (nyt - parseInt(aika)) / 1000 >= 900) {
				this.timerService.clear();
				this.store.dispatch(clearCart());
			}
		});

		// Tarkista ostoskorin tuotteiden määrä ja käynnistä tai pysäytä ajastin sen mukaan
		this.ostoskoriCount$.subscribe((count) => {
			if (count > 0) {
				this.timerService.start();
			} else {
				this.timerService.clear();
			}
		});
	}

	// Poista tilaus tokenien päivityksestä, kun komponentti tuhotaan
	ngOnDestroy() {
		if (this.tokenRefreshSubscription) {
			this.tokenRefreshSubscription.unsubscribe();
		}
	}

	// Kirjauta käyttäjä ulos
	kirjauduUlos() {
		this.authService.postKirjauduUlos().subscribe();
		this.notificationService.newNotification('success', 'Kirjauduttu ulos');
	}
}
