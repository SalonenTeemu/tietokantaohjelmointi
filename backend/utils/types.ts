// Hakutyyppi teoksille
export interface Haku {
	nimi: string | null;
	tekija: string | null;
	luokka: string | null;
	tyyppi: string | null;
}

// Tyyppi tilausten luonnille
export interface Tilaus {
	asiakasId: number;
	instanssit: [];
}
