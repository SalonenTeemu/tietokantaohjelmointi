import { createReducer, on } from '@ngrx/store';
import { setUser, logout } from '../actions/auth.actions';

export const initialAuthState: any | null = null;

export const authReducer = createReducer(
	initialAuthState,
	on(setUser, (_, { user }) => (user ? user : null)),
	on(logout, () => null)
);
