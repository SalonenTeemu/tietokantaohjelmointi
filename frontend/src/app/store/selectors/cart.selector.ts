import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Ostoskori } from '../../models/ostoskori';

// Ostoskorin tilan valitsijat, jotka tarjoavat pääsyn ostoskorin tietoihin
export const selectCart = createFeatureSelector<Ostoskori>('cart');
export const selectCartItems = createSelector(selectCart, (cart) => cart.tuotteet);
export const selectCartTotal = createSelector(selectCart, (cart) =>
	Number(cart.tuotteet.reduce((total: number, item: any) => total + Number(item.teosInstanssi.hinta), 0).toFixed(2))
);
export const selectCartShipping = createSelector(selectCart, (cart) => cart.postikulut);
export const selectCartOrderId = createSelector(selectCart, (cart) => cart.tilausId);
