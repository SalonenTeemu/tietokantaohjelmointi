import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
// AuthInterceptor on HttpInterceptor, joka lisää pyyntöön withCredentials-ominaisuuden
export class AuthInterceptor implements HttpInterceptor {
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const cloned = req.clone({
			withCredentials: true,
		});
		return next.handle(cloned);
	}
}
