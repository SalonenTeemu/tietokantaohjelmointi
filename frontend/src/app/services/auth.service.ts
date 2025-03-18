import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { logout, setUser } from '../store/actions/auth.actions';
import { Observable, of, map, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Kayttaja } from '../models/kayttaja';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = 'http://localhost:8041/api/auth';

	constructor(
		private store: Store,
		private http: HttpClient
	) {}

	postKirjaudu(email: string, salasana: string): Observable<boolean> {
		const user = { email, salasana };
		return this.http.post<{ success: boolean; message: Kayttaja }>(`${this.apiUrl}/kirjaudu`, user, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					const responseBody = response.body;
					const kayttaja = responseBody?.message;
					if (kayttaja) {
						this.store.dispatch(setUser({ user: kayttaja }));
					} else {
						console.error('Kayttajaa ei löytynyt');
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

	postRekisteroidy(nimi: string, email: string, puhelin: string, osoite: string, salasana: string): Observable<boolean> {
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

	postKirjauduUlos(): Observable<boolean> {
		return this.http.post<unknown>(`${this.apiUrl}/kirjaudu-ulos`, {}, { observe: 'response' }).pipe(
			map((response) => {
				console.log('Uloskirjautumine', response);
				if (response.ok) {
					this.store.dispatch(logout());
					return true;
				}
				return false;
			}),
			catchError((error) => {
				console.error('Uloskirjautuminen epäonnistui:', error);
				return of(false);
			})
		);
	}

	getKayttaja(): Observable<boolean> {
		return this.http.get<{ success: boolean; message: Kayttaja }>(`${this.apiUrl}/profiili`, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					const responseBody = response.body;
					const kayttaja = responseBody?.message;
					if (kayttaja) {
						this.store.dispatch(setUser({ user: kayttaja }));
					} else {
						return false;
					}
				} else {
					return false;
				}
				return true;
			}),
			catchError(() => {
				return of(false);
			})
		);
	}
}
