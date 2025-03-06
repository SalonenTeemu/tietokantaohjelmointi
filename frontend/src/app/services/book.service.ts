import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Teos, UusiTeos } from '../models/teos';
import { TeosInstanssi } from '../models/teosInstanssi';
import { Luokka, Tyyppi } from '../models/LuokkaTyyppi';

@Injectable({
	providedIn: 'root',
})
export class BookService {
	private apiUrl = 'http://localhost:8041/api';

	constructor(private http: HttpClient) {}

	haeTeokset(query: { nimi?: string; tekija?: string; tyyppi?: string; luokka?: string }): Observable<Teos[]> {
		return this.http.get<{ message: Teos[] }>(`${this.apiUrl}/teos`, { params: query }).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Haku epäonnistui:', error);
				return throwError(() => new Error('Teosten hakeminen epäonnistui. Yritä uudelleen.'));
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

	haeTeosLuokat(): Observable<Luokka[]> {
		return this.http.get<{ message: Luokka[] }>(`${this.apiUrl}/teos/luokat`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Luokkien haku epäonnistui:', error);
				return throwError(() => new Error('Teosluokkien hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	haeTeosTyypit(): Observable<Tyyppi[]> {
		return this.http.get<{ message: Tyyppi[] }>(`${this.apiUrl}/teos/tyypit`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Typpien haku epäonnistui:', error);
				return throwError(() => new Error('Teostyyppien hakeminen epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	lisaaTeos(teos: UusiTeos): Observable<boolean> {
		console.log('Lisätään teos:', teos);
		return this.http.post<{ message: string }>(`${this.apiUrl}/teos`, teos, { observe: 'response' }).pipe(
			map((response) => {
				if (response.ok) {
					console.log(response.body?.message);
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
}
