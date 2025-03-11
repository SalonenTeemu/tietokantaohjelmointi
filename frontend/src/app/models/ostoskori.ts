import { OstoskoriTuote } from './ostoskoriTuote';

// Esittää ostoskorin sisältöä
export interface Ostoskori {
	tuotteet: OstoskoriTuote[];
	tilausId: number | null;
	postikulut: number;
}
