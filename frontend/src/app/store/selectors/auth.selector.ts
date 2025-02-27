import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Kayttaja } from '../../models/kayttaja';

export const selectAuthState = createFeatureSelector<Kayttaja | null>('auth');

export const selectIsLoggedIn = createSelector(selectAuthState, (user) => !!user);
export const selectCurrentUser = createSelector(selectAuthState, (user) => user);
export const selectUserId = createSelector(selectAuthState, (user) => user?.kayttajaId);
