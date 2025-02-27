import { OstoskoriTuote } from './ostoskoriTuote';

export interface OstoskoriState {
	tuotteet: OstoskoriTuote[];
	tilausId: number | null;
	postikulut: number;
}
