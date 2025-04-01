import { Store } from '@ngrx/store';
import { addNotification } from '../store/actions/notification.actions';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
// Palvelu, joka käsittelee ilmoituksia sovelluksessa
export class NotificationService {
	constructor(private store: Store) {}

	/**
	 * Lisää uuden ilmoituksen sovellukseen.
	 * @param type Ilmoituksen tyyppi ('success', 'error' tai 'info')
	 * @param message Ilmoituksen viesti
	 */
	newNotification(type: string, message: string) {
		this.store.dispatch(addNotification({ notification: { type, message } }));
	}
}
