import { Teos } from './teos';
import { TeosInstanssi } from './teosInstanssi';

// Esittää tuotetta ostoskorissa
export interface OstoskoriTuote {
	id: number;
	teos: Teos;
	teosInstanssi: TeosInstanssi;
}
