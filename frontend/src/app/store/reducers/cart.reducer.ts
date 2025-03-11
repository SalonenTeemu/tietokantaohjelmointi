import { createReducer, on } from '@ngrx/store';
import { addToCart, removeFromCart, clearCart, setOrder, cancelOrder } from '../actions/cart.actions';
import { Ostoskori } from '../../models/ostoskori';

const initialCartState: Ostoskori = {
	tuotteet: [],
	postikulut: 0,
	tilausId: null,
};

export const getCartState: Ostoskori = JSON.parse(localStorage.getItem('ostoskori') || '{"tuotteet": [], "tilausId": null, "postikulut": 0}');

export const cartReducer = createReducer(
	getCartState,
	on(addToCart, (state, { item }) => {
		const updatedState = {
			...state,
			tuotteet: [...state.tuotteet, item],
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	}),
	on(removeFromCart, (state, { id }) => {
		const updatedState = {
			...state,
			tuotteet: state.tuotteet.filter((item: any) => item.id !== id),
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	}),
	on(clearCart, () => {
		localStorage.setItem('ostoskori', JSON.stringify(initialCartState));
		return initialCartState;
	}),
	on(setOrder, (state, { shipping, orderId }) => {
		const updatedState = {
			...state,
			postikulut: shipping,
			tilausId: orderId,
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	}),
	on(cancelOrder, (state) => {
		const updatedState = {
			...state,
			tilausId: null,
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	})
);
