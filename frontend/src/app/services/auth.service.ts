import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { logout, setLoading, setUser } from '../store/actions/auth.actions';
import { Observable, of, map, catchError, take, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Kayttaja } from '../models/kayttaja';
import { selectCartOrderId } from '../store/selectors/cart.selector';
import { OrderService } from './order.service';
import { cancelOrder } from '../store/actions/cart.actions';
import { API_URL } from '../utils/constants';

@Injectable({
	providedIn: 'root',
})
// Autentikointipalvelu, joka käsittelee käyttäjän kirjautumista, rekisteröitymistä, tokenien päivitystä ja uloskirjautumista
export class AuthService {
	private apiUrl = `${API_URL}/auth`;
	private tilausId$;
	constructor(
		private store: Store,
		private orderService: OrderService,
		private http: HttpClient
	) {
		this.tilausId$ = this.store.select(selectCartOrderId);
	}

	/**
	 * Kirjautuu käyttäjän sisään annetulla sähköpostiosoitteella ja salasanalla.
	 *
	 * @param email - Käyttäjän sähköpostiosoite
	 * @param salasana Käyttäjän salasana
	 * @return Palauttaa true, jos kirjautuminen onnistuu, muuten false
	 */
	postKirjaudu(email: string, salasana: string): Observable<boolean> {
		const user = { email, salasana };
		return this.http.post<{ success: boolean; message: Kayttaja }>(`${this.apiUrl}/kirjaudu`, user, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					const responseBody = response.body;
					const kayttaja = responseBody?.message;
					// Tarkistetaan, että käyttäjä on olemassa ja asetetaan se store-tilaan
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

	/**
	 * Lähettää rekisteröitymistiedot palvelimelle ja käsittelee vastauksen.
	 *
	 * @param nimi - Käyttäjän nimi
	 * @param email - Käyttäjän sähköpostiosoite
	 * @param puhelin - Käyttäjän puhelinnumero
	 * @param osoite - Käyttäjän osoite
	 * @param salasana - Käyttäjän salasana
	 * @return Palauttaa true, jos rekisteröinti onnistuu, muuten false
	 */
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

	/**
	 * Lähettää uloskirjautumispyynnön palvelimelle ja käsittelee vastauksen
	 * Peruu tilauksen, mikäli käyttäjä on kirjautumassa ulos ja tilaus on kesken
	 * @return Palauttaa true, jos uloskirjautuminen onnistuu, muuten false
	 */
	postKirjauduUlos(): Observable<boolean> {
		return this.tilausId$.pipe(
			take(1),
			switchMap((tilausId) => {
				if (tilausId !== null) {
					return this.orderService.postPeruutaTilaus(tilausId).pipe(
						map((success: boolean) => {
							if (success) {
								this.store.dispatch(cancelOrder());
							}
							return success;
						}),
						catchError(() => {
							return of(false);
						})
					);
				}
				return of(true);
			}),
			switchMap(() => {
				return this.http.post<unknown>(`${this.apiUrl}/kirjaudu-ulos`, {}, { observe: 'response' }).pipe(
					map((response) => {
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
			})
		);
	}

	/**
	 * Lähettää pyynnön tokenien päivittämiseksi palvelimelle ja käsittelee vastauksen.
	 *
	 * @return Palauttaa true, jos tokenien päivitys onnistuu, muuten false
	 */
	paivitaTokenit(): Observable<boolean> {
		return this.http.post(`${this.apiUrl}/paivita`, {}, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					console.log('Tokenit päivitetty onnistuneesti');
					return true;
				} else {
					console.error('Tokenien päivitys epäonnistui');
					return false;
				}
			}),
			catchError(() => {
				return of(false);
			})
		);
	}

	/**
	 * Hakee käyttäjän tiedot palvelimelta ja asettaa ne store-tilaan. Palauttaa true, jos käyttäjätiedot löytyvät, muuten false
	 *
	 * @return Palauttaa true, jos käyttäjätiedot löytyvät, muuten false
	 */
	getKayttaja(): Observable<boolean> {
		this.store.dispatch(setLoading());

		return this.http.get<{ success: boolean; message: Kayttaja }>(`${this.apiUrl}/profiili`, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					const kayttaja = response.body?.message;
					// Tarkistetaan, että käyttäjä on olemassa ja asetetaan se store-tilaan, muuten asetetaan null
					if (kayttaja) {
						this.store.dispatch(setUser({ user: kayttaja }));
					} else {
						this.store.dispatch(setUser({ user: null }));
					}
				}
				// Jos käyttäjätietoja ei löydy, asetetaan store-tilassa käyttäjä null-arvoksi
				else {
					this.store.dispatch(setUser({ user: null }));
				}
				return response.ok;
			}),
			// Jos käyttäjätietojen haku epäonnistuu, asetetaan store-tilassa käyttäjä null-arvoksi
			catchError(() => {
				this.store.dispatch(setUser({ user: null }));
				return of(false);
			})
		);
	}
}
