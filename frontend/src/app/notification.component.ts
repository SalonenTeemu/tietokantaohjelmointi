import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectNotifications } from './store/selectors/notification.selector';
import { CommonModule } from '@angular/common';
import { removeNotification } from './store/actions/notification.actions';

@Component({
	selector: 'app-notification',
	templateUrl: './notification.component.html',
	imports: [CommonModule],
	styleUrls: ['./notification.component.css'],
	standalone: true,
})
// Ilmoituskomponentti, joka näyttää käyttäjälle ilmoituksia
export class NotificationComponent implements OnInit {
	notifications$: Observable<{ type: string; message: string }[]>;

	// Rakentaja alustaa ilmoitukset storesta
	constructor(private store: Store) {
		this.notifications$ = this.store.select(selectNotifications);
	}

	// Komponentti alustuu ja asettaa 4 sekunnin ajan ilmoituksille
	ngOnInit() {
		this.notifications$.subscribe((notifications) => {
			notifications.forEach((notification, index) => {
				setTimeout(() => {
					this.store.dispatch(removeNotification({ index }));
				}, 4000);
			});
		});
	}
}
