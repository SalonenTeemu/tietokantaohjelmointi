import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal, selectCartShipping, selectCartOrderId } from '../../store/selectors/cart.selector';
import { clearCart, cancelOrder } from '../../store/actions/cart.actions';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';

@Component({
	selector: 'app-order-overview',
	imports: [CommonModule],
	templateUrl: './order-overview.component.html',
	styleUrls: ['./order-overview.component.css'],
	standalone: true,
})
// Tilauksen yhteenvetokomponentti
export class OrderOverviewComponent implements OnDestroy {
	ostoskoriTuotteet$: Observable<OstoskoriTuote[]>;
	toimituskulut$: Observable<number>;
	tuotteetYhteensa$: Observable<number>;
	yhteensa$: Observable<number>;
	tilausId$: Observable<number | null>;

	private tilausVahvistettu = false;
	private store = inject(Store);

	// Rakentaja alustaa tilauksen yhteenvetokomponentin ja tilat storesta
	constructor(
		private router: Router,
		private orderService: OrderService,
		private notificationService: NotificationService
	) {
		this.ostoskoriTuotteet$ = this.store.select(selectCartItems);
		this.toimituskulut$ = this.store.select(selectCartShipping);
		this.tilausId$ = this.store.select(selectCartOrderId);
		this.tuotteetYhteensa$ = this.store.select(selectCartTotal).pipe(map((total) => Number(total)));
		this.yhteensa$ = combineLatest<[number, number]>([this.tuotteetYhteensa$, this.toimituskulut$]).pipe(
			map(([tuotteetYhteensa, toimituskulut]) => tuotteetYhteensa + toimituskulut)
		);
	}
	ngOnDestroy() {
		// Peruuta tilaus vain, jos sitä ei ole vahvistettu
		if (!this.tilausVahvistettu) {
			this.peruutaTilaus();
		}
	}

	// Vahvistaa tilauksen ja ohjaa käyttäjän tilausvahvistussivulle
	vahvistaTilaus() {
		this.tilausVahvistettu = true;
		this.tilausId$.pipe(take(1)).subscribe((tilausId) => {
			if (tilausId !== null) {
				this.orderService.postVahvistaTilaus(tilausId).subscribe((success: boolean) => {
					// Tilauksen vahvistaminen onnistui, ohjataan käyttäjä tilausvahvistussivulle
					if (success) {
						this.notificationService.newNotification('success', 'Tilaus vahvistettu');
						combineLatest([this.ostoskoriTuotteet$, this.toimituskulut$, this.yhteensa$])
							.pipe(take(1))
							.subscribe(([ostoskoriTuotteet, toimituskulut, yhteensa]) => {
								this.store.dispatch(clearCart());
								// Annetaan tilauksen tiedot tilausvahvistussivulle
								this.router.navigate(['/tilaus/vahvistettu'], { state: { tuotteet: ostoskoriTuotteet, toimituskulut, yhteensa } });
							});
					} else {
						this.notificationService.newNotification('error', 'Tilauksen vahvistaminen epäonnistui');
					}
				});
			} else {
				this.notificationService.newNotification('error', 'Tilauksen luonti epäonnistui');
			}
		});
	}

	// Peruuta tilaus ja ohjaa käyttäjän ostoskoriin
	keskeytaTilaus() {
		this.router.navigate(['/ostoskori']);
	}

	// Peruuta tilaus
	peruutaTilaus() {
		this.tilausId$.pipe(take(1)).subscribe((tilausId) => {
			if (tilausId !== null) {
				this.orderService.postPeruutaTilaus(tilausId).subscribe((success: boolean) => {
					// Tilauksen peruminen onnistui
					if (success) {
						// Poistetaan tilausid
						this.store.dispatch(cancelOrder());
						this.notificationService.newNotification('success', 'Tilaus peruttu');
					} else {
						this.notificationService.newNotification('error', 'Tilauksen peruminen epäonnistui');
					}
				});
			} else {
				this.notificationService.newNotification('error', 'Tilauksen peruminen epäonnistui');
			}
		});
	}
}
