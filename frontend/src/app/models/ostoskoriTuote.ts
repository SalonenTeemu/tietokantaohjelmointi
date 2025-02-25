import { Teos } from './teos';
import { TeosInstanssi } from './teosInstanssi';

export interface OstoskoriTuote {
	id: number;
	teos: Teos;
	teosInstanssi: TeosInstanssi;
}
