import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
// Palvelu, joka käsittelee raporttien hakua ja käsittelyä
export class ReportService {
	private apiUrl = 'http://localhost:8041/api';

	constructor(private http: HttpClient) {}

	/**
	 * Hakee palvelimelta raportin, joka sisältää divarin luokkien myynnin tiedot.
	 *
	 * @param divariId - Divarin ID, jolle halutaan hakea luokkaraportti
	 * @returns Raportti, joka sisältää luokkamyyntiä koskevat tiedot
	 */
	getDivariLuokkaRaportti(divariId: number): Observable<any[]> {
		return this.http.get<{ message: any[] }>(`${this.apiUrl}/raportti/luokkamyynti/${divariId}`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Raportin haku epäonnistui:', error);
				return throwError(() => new Error('Raportin haku epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	/**
	 * Hakee palvelimelta raportin, joka sisältää kaikkien divarien luokkien myynnin tiedot.
	 *
	 * @returns Raportti, joka sisältää kaikkien divarien luokkamyyntiä koskevat tiedot
	 */
	getKeskusdivariLuokkaRaportti(): Observable<any[]> {
		return this.http.get<{ message: any[] }>(`${this.apiUrl}/raportti/luokkamyynti`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Raportin haku epäonnistui:', error);
				return throwError(() => new Error('Raportin haku epäonnistui. Yritä uudelleen.'));
			})
		);
	}

	/**
	 * Hakee palvelimelta raportin, joka sisältää asiakastiedot viimeisen vuoden ajalta.
	 *
	 * @returns Ladattava CSV-tiedosto, joka sisältää asiakastiedot
	 */
	getKeskusdivariAsiakasRaportti(): Observable<Blob> {
		return this.http.get(`${this.apiUrl}/raportti/asiakas-viime-vuosi`, { responseType: 'blob' }).pipe(
			catchError((error: unknown) => {
				console.error('Raportin haku epäonnistui:', error);
				return throwError(() => new Error('Raportin haku epäonnistui. Yritä uudelleen.'));
			})
		);
	}
}
