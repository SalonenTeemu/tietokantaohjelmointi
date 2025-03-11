import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Teos } from '../models/teos';
import { TeosInstanssi } from '../models/teosInstanssi';

@Injectable({
	providedIn: 'root',
})
export class BookService {
	private apiUrl = 'http://localhost:8041/api';

	constructor(private http: HttpClient) {}

	getKaikkiTeokset(): Observable<Teos[]> {
		return this.http.get<{ message: Teos[] }>(`${this.apiUrl}/teos`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Teosten haku epäonnistui:', error);
				return throwError(() => new Error('Teosten hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	getTeokset(query: { nimi?: string; tekija?: string; tyyppi?: string; luokka?: string }): Observable<Teos[]> {
		return this.http.get<{ message: Teos[] }>(`${this.apiUrl}/teos/hae`, { params: query }).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Haku epäonnistui:', error);
				return throwError(() => new Error('Teosten hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	getDivarinTeokset(divariId: number): Observable<any[]> {
		return this.http.get<{ message: any[] }>(`${this.apiUrl}/teos/${divariId}`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Divarin teosten haku epäonnistui:', error);
				return throwError(() => new Error('Divarin teosten hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	getTeosInstanssit(teosId: string): Observable<TeosInstanssi[]> {
		return this.http.get<{ message: TeosInstanssi[] }>(`${this.apiUrl}/teos/${teosId}/instanssit`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Instanssien haku epäonnistui:', error);
				return throwError(() => new Error('Teosinstanssien hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	getTeosLuokat(): Observable<any[]> {
		return this.http.get<{ message: any[] }>(`${this.apiUrl}/teos/luokat`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Luokkien haku epäonnistui:', error);
				return throwError(() => new Error('Teosluokkien hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	getTeosTyypit(): Observable<any[]> {
		return this.http.get<{ message: any[] }>(`${this.apiUrl}/teos/tyypit`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Typpien haku epäonnistui:', error);
				return throwError(() => new Error('Teostyyppien hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	postLisaaTeos(teos: any): Observable<boolean> {
		return this.http.post<{ message: string }>(`${this.apiUrl}/teos`, teos, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					return true;
				}
				return false;
			}),
			catchError((error: unknown) => {
				console.error('Teoksen lisäys epäonnistui:', error);
				return of(false);
			})
		);
	}

	postLisaaTeosInstanssi(instanssi: any): Observable<boolean> {
		return this.http.post<{ message: string }>(`${this.apiUrl}/teos/${instanssi.teosId}`, instanssi, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					return true;
				}
				return false;
			}),
			catchError((error: unknown) => {
				console.error('Teosinstanssin lisäys epäonnistui:', error);
				return of(false);
			})
		);
	}
}
