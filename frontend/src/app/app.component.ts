import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { BookService } from './services/book.service';
import { selectIsLoggedIn, selectUserRole } from './store/selectors/auth.selector';
import { addLuokat, addTyypit } from './store/actions/category.actions';
import { NotificationService } from './services/notification.service';
import { NotificationComponent } from './notification.component';

@Component({
	selector: 'app-root',
	standalone: true,
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	imports: [RouterModule, CommonModule, NotificationComponent],
})
export class AppComponent implements OnInit {
	kirjautunut$: Observable<boolean>;
	rooli$: Observable<string | undefined>;

	constructor(
		private store: Store,
		private authService: AuthService,
		private bookService: BookService,
		private notificationService: NotificationService
	) {
		this.kirjautunut$ = this.store.select(selectIsLoggedIn);
		this.rooli$ = this.store.select(selectUserRole) || undefined;
	}

	ngOnInit() {
		this.authService.getKayttaja().subscribe();
		this.bookService.getTeosLuokat().subscribe((luokat: string[]) => {
			this.store.dispatch(addLuokat({ luokat }));
		});
		this.bookService.getTeosTyypit().subscribe((tyypit: string[]) => {
			this.store.dispatch(addTyypit({ tyypit }));
		});
	}

	kirjauduUlos() {
		this.authService.postKirjauduUlos().subscribe();
		this.notificationService.newNotification('success', 'Kirjauduttu ulos');
	}
}
