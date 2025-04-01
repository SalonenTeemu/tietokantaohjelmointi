import { createAction, props } from '@ngrx/store';

// Ilmoituksien tilan toiminnot
export const addNotification = createAction('[Notification] Add Notification', props<{ notification: { type: string; message: string } }>());
export const removeNotification = createAction('[Notification] Remove Notification', props<{ index: number }>());
export const clearNotifications = createAction('[Notification] Clear Notifications');
