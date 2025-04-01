import { createReducer, on } from '@ngrx/store';
import { addTyypit, addLuokat } from '../actions/category.actions';
import { Kategoriat } from '../../models/kategoriat';

// Luokkien ja tyyppien tila
export const initialCategoryState: Kategoriat = { tyypit: [], luokat: [] };

// Kategorioiden reduceri, joka käsittelee luokkien ja tyyppien tilaa
export const categoryReducer = createReducer(
	initialCategoryState,
	// Lisää tyypit
	on(addTyypit, (state, { tyypit }) => {
		const updatedState = {
			...state,
			tyypit: tyypit,
		};
		return updatedState;
	}),
	// Lisää luokat
	on(addLuokat, (state, { luokat }) => {
		const updatedState = {
			...state,
			luokat: luokat,
		};
		return updatedState;
	})
);
