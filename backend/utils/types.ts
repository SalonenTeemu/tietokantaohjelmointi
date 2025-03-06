// Hakutyyppi teoksille
export interface Haku {
	nimi: string | null;
	tekija: string | null;
	luokka: string | null;
	tyyppi: string | null;
}

// Tyyppi tilausten validointiin
export interface TilausValidointi {
	kayttajaId: number;
	instanssit: TeosInstanssi[];
}

// Lisätty tilaus
export interface LisattyTilaus {
	tilausId: number;
	tila: string;
	tilauspvm: Date;
	postikulut: number;
	kokonaishinta: number;
	kayttajaId: number;
}

// Tilaustiedot
export interface TilausTiedot {
	kayttajaId: number;
	tilauspvm: Date;
	kokonaishinta: number;
	postikulut: number;
}

// Teos
export interface Teos {
	isbn?: string;
	nimi: string;
	tekija: string;
	julkaisuvuosi: number;
	paino: number;
	tyyppiId: number;
	luokkaId: number;
}

// TeosInstanssi
export interface TeosInstanssi {
	teosInstanssiId: string;
	hinta: number;
	kunto: string;
	sisaanostohinta: number;
	myyntipvm: Date | null;
	tila: string;
	teosId: string;
	tilausId: number | null;
	divariId: number;
	paino?: number;
}
