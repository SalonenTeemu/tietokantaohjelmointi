import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal } from '../../store/selectors/cart.selector';
import { removeFromCart, clearCart } from '../../store/actions/cart.actions';
import { selectIsLoggedIn, selectUserId } from '../../store/selectors/auth.selector';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { combineLatest, Observable, take } from 'rxjs';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';

@Component({
	selector: 'app-cart',
	standalone: true,
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.css'],
	imports: [CommonModule],
})
export class CartComponent {
	ostoskoriTuotteet$: Observable<OstoskoriTuote[]>;
	yhteensa$: Observable<number>;
	kirjautunut$: Observable<boolean>;
	kayttajaId$: Observable<number | undefined>;

	constructor(
		private store: Store,
		private router: Router,
		private orderService: OrderService
	) {
		this.ostoskoriTuotteet$ = this.store.select(selectCartItems);
		this.yhteensa$ = this.store.select(selectCartTotal);
		this.kirjautunut$ = this.store.select(selectIsLoggedIn);
		this.kayttajaId$ = this.store.select(selectUserId);
	}

	poistaOstoskorista(id: number) {
		this.store.dispatch(removeFromCart({ id }));
	}

	tyhjennaOstoskori() {
		this.store.dispatch(clearCart());
	}

	tilaa() {
		combineLatest([this.ostoskoriTuotteet$, this.kayttajaId$])
			.pipe(take(1))
			.subscribe(([ostoskoriTuotteet, kayttajaId]) => {
				if (!kayttajaId) {
					alert('User not logged in!');
					return;
				}

				const instanssit = ostoskoriTuotteet.map((item) => item.teosInstanssi.teosInstanssiId);
				const tilaus = {
					kayttajaId,
					instanssit,
				};

				this.orderService.postLuoTilaus(tilaus).subscribe((response) => {
					if (response) {
						this.router.navigate(['/tilaus']);
					} else {
						alert('Tilauksen luonti epäonnistui');
					}
				});
			});
	}
}
