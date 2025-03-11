// Esittää kategorioiden tilaa (teosten tyypit ja luokat)
export interface Kategoriat {
	tyypit: { tyyppiId: number; nimi: string }[];
	luokat: { luokkaId: number; nimi: string }[];
}
