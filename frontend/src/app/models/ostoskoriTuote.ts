import { Teos } from './teos';
import { TeosInstanssi } from './teosInstanssi';

// Esittää ostostokorin tuotetta
export interface OstoskoriTuote {
	id: number;
	teos: Teos;
	teosInstanssi: TeosInstanssi;
}
