import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal } from '../../store/selectors/cart.selector';
import { removeFromCart, clearCart } from '../../store/actions/cart.actions';
import { selectIsLoggedIn, selectUserId } from '../../store/selectors/auth.selector';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { combineLatest, take } from 'rxjs';

@Component({
	selector: 'app-cart',
	standalone: true,
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.css'],
	imports: [CommonModule],
})
export class CartComponent {
	constructor(
		private store: Store,
		private router: Router,
		private orderService: OrderService
	) {
		this.cartItems$ = this.store.select(selectCartItems);
		this.total$ = this.store.select(selectCartTotal);
		this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
		this.userId$ = this.store.select(selectUserId);
	}

	cartItems$;
	total$;
	isLoggedIn$;
	userId$;

	removeFromCart(id: number) {
		this.store.dispatch(removeFromCart({ id }));
	}

	clearCart() {
		this.store.dispatch(clearCart());
	}

	tilaa() {
		combineLatest([this.cartItems$, this.userId$])
			.pipe(take(1))
			.subscribe(([cartItems, userId]) => {
				if (!userId) {
					alert('User not logged in!');
					return;
				}

				const instanssit = cartItems.map((item) => item.teosInstanssi.teosInstanssiId);
				const tilaus = {
					kayttajaId: userId,
					instanssit,
				};

				this.orderService.luoTilaus(tilaus).subscribe((response) => {
					if (response) {
						//this.clearCart();
						this.router.navigate(['/tilaus']);
					} else {
						alert('Tilauksen luonti epäonnistui');
					}
				});
			});
	}
}
