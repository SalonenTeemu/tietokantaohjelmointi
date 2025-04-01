import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Notifications } from '../../models/notification';

// Ilmoitusten tilan valitsijat, jotka tarjoavat pääsyn ilmoitusten tietoihin
export const selectNotificationState = createFeatureSelector<Notifications>('notifications');
export const selectNotifications = createSelector(selectNotificationState, (state) => state.notifications);
