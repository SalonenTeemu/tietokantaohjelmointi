import { createReducer, on } from '@ngrx/store';
import { addTyypit, addLuokat } from '../actions/category.actions';
import { Kategoriat } from '../../models/kategoriat';

export const initialCategoryState: Kategoriat = { tyypit: [], luokat: [] };

export const categoryReducer = createReducer(
	initialCategoryState,
	on(addTyypit, (state, { tyypit }) => {
		const updatedState = {
			...state,
			tyypit: tyypit,
		};
		return updatedState;
	}),
	on(addLuokat, (state, { luokat }) => {
		const updatedState = {
			...state,
			luokat: luokat,
		};
		return updatedState;
	})
);
