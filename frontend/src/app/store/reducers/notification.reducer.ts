import { createReducer, on } from '@ngrx/store';
import { addNotification, removeNotification, clearNotifications } from '../actions/notification.actions';
import { Notifications } from '../../models/notification';

export const initialNotificationState: Notifications = {
	notifications: [],
};

export const notificationReducer = createReducer(
	initialNotificationState,
	on(addNotification, (state, { notification }) => ({
		...state,
		notifications: [...state.notifications, { type: notification.type, message: notification.message }],
	})),
	on(removeNotification, (state, { index }) => ({
		...state,
		notifications: state.notifications.filter((_, i) => i !== index),
	})),
	on(clearNotifications, (state) => ({
		...state,
		notifications: [],
	}))
);
