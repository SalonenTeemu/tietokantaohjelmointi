import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { login, logout } from '../store/actions/auth.actions';
import { Observable, of, map, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Kayttaja } from '../models/kayttaja';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private loggedIn = false;
	private apiUrl = 'http://localhost:8041/api/auth';

	constructor(
		private store: Store,
		private http: HttpClient
	) {}

	login(email: string, salasana: string): Observable<boolean> {
		const user = {
			email,
			salasana,
		};
		return this.http.post<{ success: boolean; message: Kayttaja }>(`${this.apiUrl}/kirjaudu`, user, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					this.loggedIn = true;
					const responseBody = response.body;
					const kayttaja = responseBody?.message;
					if (kayttaja) {
						this.store.dispatch(login({ user: kayttaja }));
					} else {
						console.error('Kayttajaa ei löytynyt');
						this.loggedIn = false;
						return false;
					}
					return true;
				} else {
					return false;
				}
			}),
			catchError((error) => {
				console.error('Kirjautuminen epäonnistui:', error);
				return of(false);
			})
		);
	}
	register(nimi: string, email: string, puhelin: string, osoite: string, salasana: string): Observable<boolean> {
		const user = {
			nimi,
			email,
			puhelin,
			osoite,
			salasana,
		};
		return this.http.post<unknown>(`${this.apiUrl}/rekisteroidy`, user, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					console.log('Rekisteröinti onnistui:');
					return true;
				}
				console.log('Rekisteröinti epäonnistui:');
				return false;
			}),
			catchError((error: unknown) => {
				console.error('Rekisteröinti epäonnistui:', error);
				return of(false);
			})
		);
	}

	logout() {
		this.loggedIn = false;
		this.store.dispatch(logout());
	}

	isAuthenticated(): boolean {
		return this.loggedIn || !!localStorage.getItem('user');
	}

	getUser(): Kayttaja | null {
		const user = localStorage.getItem('user');
		if (user) {
			return JSON.parse(user);
		}
		return null;
	}
}
