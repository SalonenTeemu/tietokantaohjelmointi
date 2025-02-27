import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { TilausVastaus } from '../utils/types';
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

	luoTilaus(tilaus: unknown): Observable<unknown> {
		return this.http.post(this.apiUrl, tilaus, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					if (response.body as TilausVastaus) {
						const tilausVastaus = response.body as TilausVastaus;
						this.store.dispatch(
							setOrder({ orderId: tilausVastaus.message.tilausId, shipping: parseFloat(tilausVastaus?.message.postikulut) })
						);
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

	vahvistaTilaus(tilausId: number): Observable<boolean> {
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

	peruutaTilaus(tilausId: number): Observable<boolean> {
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
