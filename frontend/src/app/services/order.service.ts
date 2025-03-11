import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { setOrder } from '../store/actions/cart.actions';
import { Store } from '@ngrx/store';

@Injectable({
	providedIn: 'root',
})
export class OrderService {
	private apiUrl = 'http://localhost:8041/api/tilaus';
	constructor(
		private http: HttpClient,
		private store: Store
	) {}

	postLuoTilaus(tilaus: unknown): Observable<unknown> {
		return this.http.post(this.apiUrl, tilaus, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					if (response.body) {
						const tilausVastaus = response.body as { message: { tilausId: number; postikulut: number } };
						this.store.dispatch(setOrder({ orderId: tilausVastaus.message.tilausId, shipping: tilausVastaus.message.postikulut }));
					}
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

	postPeruutaTilaus(tilausId: number): Observable<boolean> {
		return this.http.post(`${this.apiUrl}/peruuta/${tilausId}`, null, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					return true;
				} else {
					console.log('Tilauksen peruminen epäonnistui');
					return false;
				}
			}),
			catchError((error) => {
				console.error('Tilauksen peruminen epäonnistui:', error);
				return of(false);
			})
		);
	}
}
