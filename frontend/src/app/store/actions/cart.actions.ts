import { createAction, props } from '@ngrx/store';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';

export const addToCart = createAction('[Cart] Add Item', props<{ item: OstoskoriTuote }>());
export const removeFromCart = createAction('[Cart] Remove Item', props<{ id: number }>());
export const clearCart = createAction('[Cart] Clear Cart');
