import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal, selectCartShipping, selectCartOrderId } from '../../store/selectors/cart.selector';
import { clearCart, cancelOrder } from '../../store/actions/cart.actions';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
	selector: 'app-order-overview',
	imports: [CommonModule],
	templateUrl: './order-overview.component.html',
	styleUrls: ['./order-overview.component.css'],
	standalone: true,
})
export class OrderOverviewComponent {
	cartItems$: Observable<OstoskoriTuote[]>;
	shipping$: Observable<number>;
	itemTotal$: Observable<number>;
	total$: Observable<number>;
	tilausId$: Observable<number | null>;

	private store = inject(Store);

	constructor(
		private router: Router,
		private orderService: OrderService
	) {
		this.cartItems$ = this.store.select(selectCartItems);
		this.shipping$ = this.store.select(selectCartShipping);
		this.tilausId$ = this.store.select(selectCartOrderId);
		this.itemTotal$ = this.store.select(selectCartTotal).pipe(map((total) => Number(total)));
		this.total$ = combineLatest<[number, number]>([this.itemTotal$, this.shipping$]).pipe(map(([itemTotal, shipping]) => itemTotal + shipping));
	}

	confirmOrder() {
		this.tilausId$.pipe(take(1)).subscribe((tilausId) => {
			if (tilausId !== null) {
				this.orderService.vahvistaTilaus(tilausId).subscribe((success: boolean) => {
					if (success) {
						alert('Tilaus vahvistettu');
						combineLatest([this.cartItems$, this.shipping$, this.total$])
							.pipe(take(1))
							.subscribe(([tuotteet, shipping, total]) => {
								this.store.dispatch(clearCart());
								this.router.navigate(['/tilaus/vahvistettu'], { state: { tuotteet, shipping, total } });
							});
					} else {
						alert('Tilauksen vahvistaminen epäonnistui');
					}
				});
			} else {
				alert('Tilauksen luonti epäonnistui');
			}
		});
	}

	cancelOrder() {
		this.tilausId$.pipe(take(1)).subscribe((tilausId) => {
			if (tilausId !== null) {
				this.orderService.peruutaTilaus(tilausId).subscribe((success: boolean) => {
					if (success) {
						this.store.dispatch(cancelOrder());
						alert('Tilaus peruttu');
					} else {
						alert('Tilauksen peruminen epäonnistui');
					}
				});
			} else {
				alert('Tilauksen luonti epäonnistui');
			}
		});

		this.router.navigate(['/ostoskori']);
	}
}
