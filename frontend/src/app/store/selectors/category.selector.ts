import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Kategoriat } from '../../models/kategoriat';

// Kategorioiden tilan valitsijat, jotka tarjoavat pääsyn luokkien ja tyyppien tietoihin
export const selectCategories = createFeatureSelector<Kategoriat>('categories');
export const selectTyypit = createSelector(selectCategories, (categories) => categories.tyypit);
export const selectLuokat = createSelector(selectCategories, (categories) => categories.luokat);
