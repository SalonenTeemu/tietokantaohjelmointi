import { Divari } from './divari';
import { Teos } from './teos';

export interface TeosInstanssi {
	teosInstanssiId: string;
	hinta: number;
	kunto?: string;
	divari: Divari;
	teos: Teos;
}
