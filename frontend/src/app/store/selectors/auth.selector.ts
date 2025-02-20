import { createFeatureSelector, createSelector } from '@ngrx/store';
import { User } from '../../models/user';

export const selectAuthState = createFeatureSelector<User | null>('auth');

export const selectIsLoggedIn = createSelector(selectAuthState, (user) => !!user);
export const selectCurrentUser = createSelector(selectAuthState, (user) => user);
