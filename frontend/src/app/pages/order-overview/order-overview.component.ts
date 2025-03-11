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
	ostoskoriTuotteet$: Observable<OstoskoriTuote[]>;
	toimituskulut$: Observable<number>;
	tuotteetYhteensa$: Observable<number>;
	yhteensa$: Observable<number>;
	tilausId$: Observable<number | null>;

	private store = inject(Store);

	constructor(
		private router: Router,
		private orderService: OrderService
	) {
		this.ostoskoriTuotteet$ = this.store.select(selectCartItems);
		this.toimituskulut$ = this.store.select(selectCartShipping);
		this.tilausId$ = this.store.select(selectCartOrderId);
		this.tuotteetYhteensa$ = this.store.select(selectCartTotal).pipe(map((total) => Number(total)));
		this.yhteensa$ = combineLatest<[number, number]>([this.tuotteetYhteensa$, this.toimituskulut$]).pipe(
			map(([tuotteetYhteensa, toimituskulut]) => tuotteetYhteensa + toimituskulut)
		);
	}

	vahvistaTilaus() {
		this.tilausId$.pipe(take(1)).subscribe((tilausId) => {
			if (tilausId !== null) {
				this.orderService.postVahvistaTilaus(tilausId).subscribe((success: boolean) => {
					if (success) {
						alert('Tilaus vahvistettu');
						combineLatest([this.ostoskoriTuotteet$, this.toimituskulut$, this.yhteensa$])
							.pipe(take(1))
							.subscribe(([ostoskoriTuotteet, toimituskulut, yhteensa]) => {
								this.store.dispatch(clearCart());
								this.router.navigate(['/tilaus/vahvistettu'], { state: { tuotteet: ostoskoriTuotteet, toimituskulut, yhteensa } });
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

	peruutaTilaus() {
		this.tilausId$.pipe(take(1)).subscribe((tilausId) => {
			if (tilausId !== null) {
				this.orderService.postPeruutaTilaus(tilausId).subscribe((success: boolean) => {
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
