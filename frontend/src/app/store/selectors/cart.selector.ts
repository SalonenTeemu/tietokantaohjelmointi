import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartItem } from '../../models/cart-item';

export const selectCart = createFeatureSelector<CartItem[]>('cart');

export const selectCartItems = createSelector(selectCart, (cart) => cart);
export const selectCartTotal = createSelector(selectCart, (cart) => cart.reduce((total, item) => total + item.price * item.quantity, 0));
