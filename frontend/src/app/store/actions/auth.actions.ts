import { createAction, props } from '@ngrx/store';
import { Kayttaja } from '../../models/kayttaja';

export const login = createAction('[Auth] Login', props<{ user: Kayttaja }>());
export const logout = createAction('[Auth] Logout');
