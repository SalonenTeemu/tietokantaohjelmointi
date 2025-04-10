import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { setOrder } from '../store/actions/cart.actions';
import { Store } from '@ngrx/store';

@Injectable({
	providedIn: 'root',
})
// Tilauksen palvelu, joka käsittelee tilausten hakua, luontia, vahvistamista ja perumista
export class OrderService {
	private apiUrl = 'http://localhost:8041/api/tilaus';
	private peruutettuTilaus = false;
	constructor(
		private http: HttpClient,
		private store: Store
	) {}

	/**
	 * Hakee käyttäjän tekemät tilaukset palvelimelta.
	 *
	 * @param kayttajaId - Käyttäjän ID, jonka tilaukset halutaan hakea
	 * @returns Observable, joka palauttaa käyttäjän tilaukset tai null, jos haku epäonnistuu
	 */
	getTilaukset(): Observable<unknown> {
		return this.http.get(`${this.apiUrl}`, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok && response.body) {
					const tilaukset = response.body as { message: unknown[] };
					return tilaukset.message;
				} else {
					console.log('Tilauksen haku epäonnistui');
					return null;
				}
			}),
			catchError((error) => {
				console.error('Tilauksen haku epäonnistui:', error);
				return of(null);
			})
		);
	}

	/**
	 * Lähettää uuden tilauksen palvelimelle ja tallentaa onnistuneen tilauksen store-tilaan.
	 *
	 * @param tilaus - Tilaustiedot
	 * @returns Observable, joka palauttaa true, jos tilauksen luonti onnistui, muuten false
	 */
	postLuoTilaus(tilaus: unknown): Observable<unknown> {
		return this.http.post(this.apiUrl, tilaus, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					if (response.body) {
						const tilausVastaus = response.body as { message: { tilausId: number; postikulut: number } };
						this.store.dispatch(setOrder({ orderId: tilausVastaus.message.tilausId, shipping: tilausVastaus.message.postikulut }));
					}
					this.peruutettuTilaus = false;
					return true;
				} else {
					console.log('Tilauksen luonti epäonnistui');
					return false;
				}
			}),
			catchError((error) => {
				console.error('Tilauksen luonti epäonnistui:', error);
				return of(false);
			})
		);
	}

	/**
	 * Vahvistaa tilauksen palvelimella ja palauttaa tilauksen vahvistamisen tuloksen.
	 *
	 * @param tilausId - Tilaus ID, joka halutaan vahvistaa
	 * @returns True, jos tilauksen vahvistaminen onnistui, muuten false
	 */
	postVahvistaTilaus(tilausId: number): Observable<boolean> {
		return this.http.post(`${this.apiUrl}/vahvista/${tilausId}`, null, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					return true;
				} else {
					console.log('Tilauksen vahvistaminen epäonnistui');
					return false;
				}
			}),
			catchError((error) => {
				console.error('Tilauksen vahvistaminen epäonnistui:', error);
				return of(false);
			})
		);
	}

	/**
	 * Peruuttaa tilauksen palvelimella ja palauttaa tilauksen perumisen tuloksen.
	 *
	 * @param tilausId - Tilaus ID, joka halutaan peruuttaa
	 * @returns True, jos tilauksen peruminen onnistui, muuten false
	 */
	postPeruutaTilaus(tilausId: number): Observable<boolean> {
		if (this.peruutettuTilaus) {
			return of(false);
		}
		this.peruutettuTilaus = true;
		return this.http.post(`${this.apiUrl}/peruuta/${tilausId}`, null, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					this.peruutettuTilaus = true;
					return true;
				} else {
					this.peruutettuTilaus = false;
					return false;
				}
			}),
			catchError((error) => {
				this.peruutettuTilaus = false;
				console.error('Tilauksen peruminen epäonnistui:', error);
				return of(false);
			})
		);
	}
}
