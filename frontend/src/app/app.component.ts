import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { selectIsLoggedIn } from './store/selectors/auth.selector';

@Component({
	selector: 'app-root',
	standalone: true,
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	imports: [RouterModule, CommonModule],
})
export class AppComponent {
	isLoggedIn$: Observable<boolean>;

	constructor(
		private store: Store,
		private authService: AuthService
	) {
		this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
	}

	logout() {
		this.authService.logout();
		alert('Olet kirjautunut ulos');
	}
}
