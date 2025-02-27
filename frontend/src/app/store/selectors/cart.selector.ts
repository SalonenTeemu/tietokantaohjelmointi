import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OstoskoriState } from '../../models/ostoskori';

export const selectCart = createFeatureSelector<OstoskoriState>('cart');

export const selectCartItems = createSelector(selectCart, (cart) => cart.tuotteet);

export const selectCartTotal = createSelector(selectCart, (cart) =>
	cart.tuotteet.reduce((total: number, item) => total + Number(item.teosInstanssi.hinta), 0).toFixed(2)
);

export const selectCartShipping = createSelector(selectCart, (cart) => cart.postikulut);

export const selectCartOrderId = createSelector(selectCart, (cart) => cart.tilausId);
