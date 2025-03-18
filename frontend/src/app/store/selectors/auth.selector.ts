import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Kayttaja } from '../../models/kayttaja';

export const selectAuthState = createFeatureSelector<Kayttaja | null>('auth');

export const selectIsLoggedIn = createSelector(selectAuthState, (user) => (user == null ? false : true));
export const selectUser = createSelector(selectAuthState, (user) => user);
export const selectUserRole = createSelector(selectAuthState, (user) => user?.rooli);
export const selectUserId = createSelector(selectAuthState, (user) => user?.kayttajaId);
