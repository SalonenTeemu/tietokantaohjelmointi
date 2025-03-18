import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ReportService {
	private apiUrl = 'http://localhost:8041/api';

	constructor(private http: HttpClient) {}

	getDivariLuokkaRaportti(divariId: number): Observable<any[]> {
		return this.http.get<{ message: any[] }>(`${this.apiUrl}/raportti/luokkamyynti/${divariId}`).pipe(
			map((response) => response.message),
			catchError((error: unknown) => {
				console.error('Raportin haku epäonnistui:', error);
				return throwError(() => new Error('Raportin haku epäonnistui. Yritä uudelleen.'));
			})
		);
	}
}
