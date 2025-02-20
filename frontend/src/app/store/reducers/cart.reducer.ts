import { createReducer, on } from '@ngrx/store';
import { addToCart, removeFromCart, clearCart } from '../actions/cart.actions';
import { CartItem } from '../../models/cart-item';

export const initialCartState: CartItem[] = [];

export const cartReducer = createReducer(
	initialCartState,
	on(addToCart, (state, { item }) => {
		const existingItem = state.find((cartItem) => cartItem.id === item.id);
		if (existingItem) {
			return state.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
		}
		return [...state, { ...item, quantity: 1 }];
	}),

	on(removeFromCart, (state, { id }) => state.filter((item) => item.id !== id)),

	on(clearCart, () => [])
);
