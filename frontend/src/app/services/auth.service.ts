import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { login, logout } from '../store/actions/auth.actions';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private loggedIn = false;

	constructor(private store: Store) {}

	// You can call this to simulate a login action
	login(username: string, password: string): Observable<boolean> {
		if (username === 'test' && password === 'password') {
			const user = {
				id: 1,
				username: 'test',
				email: 'test@example.com',
				token: 'fake-jwt-token',
			};
			this.store.dispatch(login({ user }));
			localStorage.setItem('user', JSON.stringify(user));
			this.loggedIn = true;
			return of(true);
		}
		return of(false);
	}

	// Logout action
	logout() {
		this.loggedIn = false;
		this.store.dispatch(logout());
		localStorage.removeItem('user');
	}

	// Check if the user is authenticated
	isAuthenticated(): boolean {
		return this.loggedIn || !!localStorage.getItem('user');
	}
}
