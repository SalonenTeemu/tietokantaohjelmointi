import { createAction, props } from '@ngrx/store';
import { Kayttaja } from '../../models/kayttaja';

export const setUser = createAction('[Auth] Set User', props<{ user: Kayttaja | null }>());
export const logout = createAction('[Auth] Logout');
export const setLoading = createAction('[Auth] Set Loading');
