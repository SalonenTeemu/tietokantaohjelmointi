import { ActionReducerMap } from '@ngrx/store';
import { cartReducer } from './reducers/cart.reducer';
import { authReducer } from './reducers/auth.reducer';

export interface AppState {
	cart: ReturnType<typeof cartReducer>;
	auth: ReturnType<typeof authReducer>;
}

export const reducers: ActionReducerMap<AppState> = {
	cart: cartReducer,
	auth: authReducer,
};
