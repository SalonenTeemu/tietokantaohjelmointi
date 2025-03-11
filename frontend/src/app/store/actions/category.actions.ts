import { createAction, props } from '@ngrx/store';

export const addLuokat = createAction('[Category] Add luokat', props<{ luokat: any[] }>());
export const addTyypit = createAction('[Category] Add tyypit', props<{ tyypit: any[] }>());
