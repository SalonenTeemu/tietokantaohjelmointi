import { ActionReducerMap } from '@ngrx/store';
import { cartReducer } from './reducers/cart.reducer';
import { authReducer } from './reducers/auth.reducer';
import { categoryReducer } from './reducers/category.reducer';

export interface AppState {
	cart: ReturnType<typeof cartReducer>;
	auth: ReturnType<typeof authReducer>;
	categories: ReturnType<typeof categoryReducer>;
}

export const reducers: ActionReducerMap<AppState> = {
	cart: cartReducer,
	auth: authReducer,
	categories: categoryReducer,
};
