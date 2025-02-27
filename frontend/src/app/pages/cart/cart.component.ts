import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal } from '../../store/selectors/cart.selector';
import { removeFromCart, clearCart } from '../../store/actions/cart.actions';
import { selectIsLoggedIn } from '../../store/selectors/auth.selector';

@Component({
	selector: 'app-cart',
	standalone: true,
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.css'],
	imports: [CommonModule],
})
export class CartComponent {
	constructor(private store: Store) {
		this.cartItems$ = this.store.select(selectCartItems);
		this.total$ = this.store.select(selectCartTotal);
		this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
	}

	cartItems$;
	total$;
	isLoggedIn$;

	removeFromCart(id: number) {
		this.store.dispatch(removeFromCart({ id }));
	}

	clearCart() {
		this.store.dispatch(clearCart());
	}
	teeTilaus() {
		alert('Tilaus tehty');
	}
}
