import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, map, Observable, Subscription, take } from 'rxjs';
import { BookService } from './book.service';
import { selectCartItems } from '../store/selectors/cart.selector';
import { OstoskoriTuote } from '../models/ostoskoriTuote';
import { Store } from '@ngrx/store';
import { clearCart } from '../store/actions/cart.actions';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
// Ajastinpalvelu, joka hallitsee ostoskorin ajastusta ja tyhjentää sen tarvittaessa
export class TimerService {
	ostoskoriTuotteet$: Observable<OstoskoriTuote[]>;
	private aikaLaskuri = new BehaviorSubject<number>(0);
	private maxAika = 900; // 15 minuuttia
	private intervalSub?: Subscription;
	private startTime: number;

	constructor(
		private bookService: BookService,
		private notificationService: NotificationService,
		private store: Store
	) {
		this.ostoskoriTuotteet$ = this.store.select(selectCartItems);
		const storedStartTime = localStorage.getItem('ajastinAlkuAika');
		if (storedStartTime) {
			// Jos localStorage sisältää tallennetun ajan, jatketaan siitä
			this.startTime = parseInt(storedStartTime);
			this.startTimerFromStoredTime();
		} else {
			// Muuten asetetaan aloitusaika nykyhetkeen
			this.startTime = Date.now();
			localStorage.setItem('ajastinAlkuAika', this.startTime.toString());
		}
	}

	// Käynnistetään ajastin tallennetusta ajasta
	private startTimerFromStoredTime() {
		this.intervalSub = interval(1000).subscribe(() => {
			const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
			const remaining = this.maxAika - elapsed;

			// Jos jäljellä oleva aika on 0 tai vähemmän, pysäytetään ajastin ja tyhjennetään ostoskori
			if (remaining <= 0) {
				this.stop();
				this.clearCart();
				this.clear();
			} else {
				this.aikaLaskuri.next(remaining);
			}
		});
	}

	// Käynnistää ajastimen
	start() {
		this.stop();
		const storedStartTime = localStorage.getItem('ajastinAlkuAika');

		if (storedStartTime) {
			// Jos localStorage sisältää tallennetun ajan, jatketaan siitä
			this.startTime = parseInt(storedStartTime);
		} else {
			// Muuten asetetaan aloitusaika nykyhetkeen
			this.startTime = Date.now();
		}
		localStorage.setItem('ajastinAlkuAika', this.startTime.toString());
		this.startTimerFromStoredTime();
	}

	// Pysäyttää ajastimen
	stop() {
		this.intervalSub?.unsubscribe();
		this.intervalSub = undefined;
	}

	// Asettaa ajastimen nollaksi ja tyhjentää localStoragen
	clear() {
		this.stop();
		localStorage.removeItem('ajastinAlkuAika');
		this.aikaLaskuri.next(0);
	}

	// Palauttaa ajanlaskurin arvon
	getCountdown() {
		return this.aikaLaskuri.asObservable();
	}

	// Tyhjentää ostoskorin tuotteet ja vapauttaa instanssit palvelimella
	clearCart() {
		this.ostoskoriTuotteet$
			.pipe(
				take(1),
				map((tuotteet) => tuotteet.map((tuote) => tuote.teosInstanssi.teosInstanssiId))
			)
			.subscribe((instanssiIdt) => {
				if (instanssiIdt.length > 0) {
					this.bookService.postVapautaInstanssit(instanssiIdt).subscribe({
						next: () => {
							this.store.dispatch(clearCart());
						},
						error: (error: Error) => {
							console.error('Virhe vapautettaessa instansseja:', error);
							this.store.dispatch(clearCart());
						},
					});
				}
			});
		this.notificationService.newNotification('info', 'Ostoskori tyhjennetty automaattisesti varausajan umpeuduttua');
	}
}
