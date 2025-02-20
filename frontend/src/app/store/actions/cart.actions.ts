import { createAction, props } from '@ngrx/store';
import { CartItem } from '../../models/cart-item';

export const addToCart = createAction('[Cart] Add Item', props<{ item: CartItem }>());
export const removeFromCart = createAction('[Cart] Remove Item', props<{ id: number }>());
export const clearCart = createAction('[Cart] Clear Cart');
