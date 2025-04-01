import { createAction, props } from '@ngrx/store';

// Luokkien ja tyyppien tilan toiminnot
export const addLuokat = createAction('[Category] Add luokat', props<{ luokat: any[] }>());
export const addTyypit = createAction('[Category] Add tyypit', props<{ tyypit: any[] }>());
