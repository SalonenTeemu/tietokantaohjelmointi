export interface Teos {
	teosId: string;
	nimi: string;
	isbn?: string;
	tekija: string;
	julkaisuvuosi: number;
	paino: number;
	luokka: string;
	tyyppi: string;
}

export interface UusiTeos {
	nimi: string;
	isbn?: string;
	tekija: string;
	julkaisuvuosi: number;
	paino: number;
	luokkaId: number;
	tyyppiId: number;
}

export interface DivarinTeos {
	teosId: string;
	nimi: string;
	isbn?: string;
	tekija: string;
	julkaisuvuosi: number;
	paino: number;
	luokka: string;
	tyyppi: string;
	instanssi_lkm: number;
}
