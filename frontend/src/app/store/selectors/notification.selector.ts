import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Notifications } from '../../models/notification';

export const selectNotificationState = createFeatureSelector<Notifications>('notifications');

export const selectNotifications = createSelector(selectNotificationState, (state) => state.notifications);
