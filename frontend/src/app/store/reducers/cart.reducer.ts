import { createReducer, on } from '@ngrx/store';
import { addToCart, removeFromCart, clearCart, setOrder, cancelOrder } from '../actions/cart.actions';
import { Ostoskori } from '../../models/ostoskori';

// Alustava ostoskoritila
const initialCartState: Ostoskori = {
	tuotteet: [],
	postikulut: 0,
	tilausId: null,
};

// Ladataan ostoskoritila paikallisesta tallennustilasta tai käytetään alustavaa tilaa, jos ei ole tallennettu
export const getCartState: Ostoskori = JSON.parse(localStorage.getItem('ostoskori') || '{"tuotteet": [], "tilausId": null, "postikulut": 0}');

// Ostoskorin reduceri, joka käsittelee ostoskoritoimintoja. Tiedot tallennetaan myös paikalliseen tallennustilaan.
export const cartReducer = createReducer(
	getCartState,
	// Lisää uusi tuote ostoskoriin
	on(addToCart, (state, { item }) => {
		const updatedState = {
			...state,
			tuotteet: [...state.tuotteet, item],
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	}),
	// Poista tuote ostoskorista
	on(removeFromCart, (state, { id }) => {
		const updatedState = {
			...state,
			tuotteet: state.tuotteet.filter((item: any) => item.id !== id),
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	}),
	// Tyhjennä ostoskori
	on(clearCart, () => {
		localStorage.setItem('ostoskori', JSON.stringify(initialCartState));
		return initialCartState;
	}),
	// Aseta tilauksen tiedot
	on(setOrder, (state, { shipping, orderId }) => {
		const updatedState = {
			...state,
			postikulut: shipping,
			tilausId: orderId,
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	}),
	// Peruuta tilaus
	on(cancelOrder, (state) => {
		const updatedState = {
			...state,
			tilausId: null,
		};
		localStorage.setItem('ostoskori', JSON.stringify(updatedState));
		return updatedState;
	})
);
