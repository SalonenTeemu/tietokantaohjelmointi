import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';

export const selectCart = createFeatureSelector<OstoskoriTuote[]>('cart');

export const selectCartItems = createSelector(selectCart, (cart) => cart);

export const selectCartTotal = createSelector(selectCart, (cart) =>
	cart.reduce((total: number, item) => total + Number(item.teosInstanssi.hinta), 0).toFixed(2)
);
