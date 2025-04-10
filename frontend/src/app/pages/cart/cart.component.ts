import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal } from '../../store/selectors/cart.selector';
import { removeFromCart, clearCart } from '../../store/actions/cart.actions';
import { selectIsLoggedIn, selectUserId } from '../../store/selectors/auth.selector';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { combineLatest, map, Observable, take } from 'rxjs';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';
import { NotificationService } from '../../services/notification.service';
import { BookService } from '../../services/book.service';

@Component({
	selector: 'app-cart',
	standalone: true,
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.css'],
	imports: [CommonModule],
})

// Ostoskori komponentti, joka näyttää käyttäjän ostoskorin sisällön ja mahdollistaa tilauksen tekemisen
export class CartComponent {
	ostoskoriTuotteet$: Observable<OstoskoriTuote[]>;
	yhteensa$: Observable<number>;
	kirjautunut$: Observable<boolean>;
	kayttajaId$: Observable<number | undefined>;

	// Rakentaja luo komponentin ja alustaa palvelut sekä tilat storesta
	constructor(
		private store: Store,
		private router: Router,
		private orderService: OrderService,
		private notificationService: NotificationService,
		private bookService: BookService
	) {
		this.ostoskoriTuotteet$ = this.store.select(selectCartItems);
		this.yhteensa$ = this.store.select(selectCartTotal);
		this.kirjautunut$ = this.store.select(selectIsLoggedIn);
		this.kayttajaId$ = this.store.select(selectUserId);
	}

	// Tuotteen poistaminen ostoskorista
	poistaOstoskorista(tuote: OstoskoriTuote) {
		this.store.dispatch(removeFromCart({ id: tuote.id }));
		this.bookService.postVapautaInstanssi(tuote.teosInstanssi.teosInstanssiId).subscribe({
			next: (success) => {
				if (!success) {
					this.notificationService.newNotification('error', 'Tuotteen vapauttaminen epäonnistui');
					return;
				}
			},
		});
		this.notificationService.newNotification('success', 'Tuote poistettu ostoskorista');
	}

	// Tyhjentää ostoskorin
	tyhjennaOstoskori() {
		this.ostoskoriTuotteet$
			.pipe(
				take(1),
				map((tuotteet) => tuotteet.map((tuote) => tuote.teosInstanssi.teosInstanssiId))
			)
			.subscribe((instanssiIdt) => {
				if (instanssiIdt.length === 0) {
					this.notificationService.newNotification('info', 'Ostoskori on jo tyhjä');
					return;
				}
				// Call the backend to release the instances
				this.bookService.postVapautaInstanssit(instanssiIdt).subscribe({
					next: (success: boolean) => {
						if (success) {
							// Dispatch the clearCart action only after the backend operation succeeds
							this.store.dispatch(clearCart());
							this.notificationService.newNotification('success', 'Ostoskori tyhjennetty');
						} else {
							this.notificationService.newNotification('error', 'Ostoskorin tyhjentäminen epäonnistui');
						}
					},
					error: (error: Error) => {
						console.error('Virhe vapautettaessa instansseja:', error);
						this.notificationService.newNotification('error', 'Ostoskorin tyhjentäminen epäonnistui');
					},
				});
			});
	}

	// Luo tilauksen ja ohjaa käyttäjän tilaus-sivulle
	tilaa() {
		combineLatest([this.ostoskoriTuotteet$, this.kayttajaId$])
			.pipe(take(1))
			.subscribe(([ostoskoriTuotteet, kayttajaId]) => {
				if (!kayttajaId) {
					this.notificationService.newNotification('error', 'Käyttäjä ei ole kirjautunut sisään');
					return;
				}
				// Hae ostoskori tuotteet
				const instanssit = ostoskoriTuotteet.map((item) => item.teosInstanssi.teosInstanssiId);
				const tilaus = {
					kayttajaId,
					instanssit,
				};
				// Luo tilaus
				this.orderService.postLuoTilaus(tilaus).subscribe((response) => {
					if (response) {
						this.router.navigate(['/tilaus']);
					} else {
						this.notificationService.newNotification('error', 'Tilauksen luonti epäonnistui');
					}
				});
			});
	}
}
