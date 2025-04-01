import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

// Autentikointitilan valitsijat, jotka tarjoavat pääsyn autentikointitilan tietoihin
export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectIsLoggedIn = createSelector(selectAuthState, (state) => state.user != null);
export const selectUser = createSelector(selectAuthState, (state) => state.user);
export const selectUserRole = createSelector(selectAuthState, (state) => state.user?.rooli);
export const selectUserId = createSelector(selectAuthState, (state) => state.user?.kayttajaId);
export const selectIsLoadingUser = createSelector(selectAuthState, (state) => state.loading);
