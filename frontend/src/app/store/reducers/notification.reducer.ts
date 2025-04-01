import { createReducer, on } from '@ngrx/store';
import { addNotification, removeNotification, clearNotifications } from '../actions/notification.actions';
import { Notifications } from '../../models/notification';

// Ilmoitusten alustava tila
export const initialNotificationState: Notifications = {
	notifications: [],
};

// Ilmoitusten reduceri, joka käsittelee ilmoitustoimintoja
export const notificationReducer = createReducer(
	initialNotificationState,
	// Lisää uusi ilmoitus
	on(addNotification, (state, { notification }) => ({
		...state,
		notifications: [...state.notifications, { type: notification.type, message: notification.message }],
	})),
	// Poista ilmoitus
	on(removeNotification, (state, { index }) => ({
		...state,
		notifications: state.notifications.filter((_, i) => i !== index),
	})),
	// Tyhjennä kaikki ilmoitukset
	on(clearNotifications, (state) => ({
		...state,
		notifications: [],
	}))
);
