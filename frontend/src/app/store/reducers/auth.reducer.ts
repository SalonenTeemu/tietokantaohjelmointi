import { createReducer, on } from '@ngrx/store';
import { login, logout } from '../actions/auth.actions';
import { Kayttaja } from '../../models/kayttaja';

export const initialAuthState: Kayttaja | null = JSON.parse(localStorage.getItem('user') || 'null');

export const authReducer = createReducer(
	initialAuthState,
	on(login, (_, { user }) => {
		localStorage.setItem('user', JSON.stringify(user));
		return user;
	}),
	on(logout, () => {
		localStorage.removeItem('user');
		return null;
	})
);
