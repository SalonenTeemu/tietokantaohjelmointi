import { createReducer, on } from '@ngrx/store';
import { addToCart, removeFromCart, clearCart } from '../actions/cart.actions';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';

export const initialCartState: OstoskoriTuote[] = [];

export const cartReducer = createReducer(
	initialCartState,
	on(addToCart, (state, { item }) => [...state, item]),
	on(removeFromCart, (state, { id }) => state.filter((item) => item.id !== id)),
	on(clearCart, () => [])
);
