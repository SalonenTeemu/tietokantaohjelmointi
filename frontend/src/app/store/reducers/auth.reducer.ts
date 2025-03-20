import { createReducer, on } from '@ngrx/store';
import { setUser, logout, setLoading } from '../actions/auth.actions';
import { Kayttaja } from '../../models/kayttaja';

export interface AuthState {
	user: Kayttaja | null;
	loading: boolean;
}

export const initialAuthState: AuthState = {
	user: null,
	loading: false,
};

export const authReducer = createReducer(
	initialAuthState,
	on(setUser, (state, { user }) => ({
		...state,
		user: user ? user : null,
		loading: false,
	})),
	on(logout, () => initialAuthState),
	on(setLoading, (state) => ({
		...state,
		loading: true,
	}))
);
