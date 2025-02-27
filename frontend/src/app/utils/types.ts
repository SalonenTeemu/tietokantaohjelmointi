export interface TarkistusTulos {
	success: boolean;
	message: string;
}

export interface TilausVastaus {
	message: {
		kayttajaId: number;
		kokonaishinta: string;
		postikulut: string;
		tila: string;
		tilausId: number;
		tilauspvm: string;
	};
}
