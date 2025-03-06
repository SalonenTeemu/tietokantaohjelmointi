export interface TeosInstanssi {
	teosInstanssiId: string;
	hinta: number;
	kunto?: string;
	divari: string;
}

export interface LuoTeosInstanssi {
	hinta: number;
	kunto: string;
	sisaanostohinta: number;
	divariId: number;
	teosId: string;
	kpl: number;
}
