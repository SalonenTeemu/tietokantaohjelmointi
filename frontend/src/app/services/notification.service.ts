import { Store } from '@ngrx/store';
import { addNotification } from '../store/actions/notification.actions';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class NotificationService {
	constructor(private store: Store) {}

	newNotification(type: string, message: string) {
		this.store.dispatch(addNotification({ notification: { type, message } }));
	}
}
