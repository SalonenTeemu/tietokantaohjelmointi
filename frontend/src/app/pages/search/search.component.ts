import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addToCart } from '../../store/actions/cart.actions';
import { Teos } from '../../models/teos';
import { TeosInstanssi } from '../../models/teosInstanssi';
import { BookService } from '../../services/book.service';
import { tarkistaHaku } from '../../utils/validate';
import { selectLuokat, selectTyypit } from '../../store/selectors/category.selector';
import { Observable } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';
import { selectCartItems } from '../../store/selectors/cart.selector';

@Component({
	selector: 'app-search',
	standalone: true,
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	imports: [CommonModule, FormsModule],
})
// Teosten hakukomponentti
export class SearchComponent {
	luokat$: Observable<{ luokkaId: number; nimi: string }[]>;
	tyypit$: Observable<{ tyyppiId: number; nimi: string }[]>;
	queryNimi = '';
	queryTekija = '';
	queryTyyppi = '';
	queryLuokka = '';

	teokset: Teos[] = [];
	valittuTeos: Teos | null = null;
	instanssit: any = [];
	ostoskoriTuotteet$: Observable<OstoskoriTuote[]>;

	// Lajittelumäärittely kunnon mukaan
	kuntoLajittelu: Record<string, number> = {
		heikko: 0,
		kohtalainen: 1,
		erinomainen: 2,
	};

	// Rakentaja alustaa tyypit, luokat, palvelut ja tilat storesta
	constructor(
		private bookService: BookService,
		private store: Store,
		private notificationService: NotificationService
	) {
		this.luokat$ = store.select(selectLuokat);
		this.tyypit$ = store.select(selectTyypit);
		this.ostoskoriTuotteet$ = store.select(selectCartItems);
	}

	// Hakee teokset ja instanssit käyttäjän syötteen perusteella
	haeTeoksia() {
		// Tarkista käyttäjän syöte ja hae kaikki teokset, jos syöte on tyhjää
		if (!tarkistaHaku(this.queryNimi, this.queryTekija, this.queryLuokka, this.queryTyyppi)) {
			this.bookService.getKaikkiTeokset().subscribe({
				next: (data: Teos[]) => {
					this.teokset = data;
					this.valittuTeos = null;
					this.instanssit = [];
				},
				error: (error) => {
					this.notificationService.newNotification('error', error.message);
				},
			});
			return;
		}
		// Muuten hae teokset käyttäjän syötteen perusteella
		this.bookService
			.getTeokset({
				nimi: this.queryNimi.trim(),
				tekija: this.queryTekija.trim(),
				tyyppi: this.queryTyyppi,
				luokka: this.queryLuokka,
			})
			.subscribe({
				next: (data: Teos[]) => {
					this.teokset = data;
					this.valittuTeos = null;
				},
				error: (error) => {
					this.notificationService.newNotification('error', error.message);
				},
			});
	}

	// Hakee valitun teoksen instanssit
	haeTeosInstanssit(teos: Teos) {
		if (this.valittuTeos && this.valittuTeos.teosId === teos.teosId) {
			this.valittuTeos = null;
			this.instanssit = [];
			return;
		}
		this.valittuTeos = teos;
		this.bookService.getTeosInstanssit(teos.teosId).subscribe({
			next: (data: TeosInstanssi[]) => {
				// Filtteröi data, jotta ostoskoriin lisätyt instanssit eivät näy
				this.ostoskoriTuotteet$.subscribe((ostoskoriTuotteet) => {
					const instanssiIdt = ostoskoriTuotteet.map((tuote) => tuote.teosInstanssi.teosInstanssiId);
					data = data.filter((tuote) => !instanssiIdt.includes(tuote.teosInstanssiId));
				});
				// Ryhmitä data hinnan, kunnon ja divarin mukaan
				const ryhmitettyData = Object.values(
					data.reduce(
						(acc, item) => {
							const key = `${item.hinta}-${item.kunto}-${item.divari}`;
							if (!acc[key]) {
								acc[key] = {
									hinta: item.hinta,
									kunto: item.kunto ? String(item.kunto) : 'Ei tietoa',
									divari: item.divari ? String(item.divari) : 'Ei tietoa',
									instanssiIdt: [],
								};
							}
							acc[key].instanssiIdt.push(item.teosInstanssiId);
							return acc;
						},
						{} as Record<string, { hinta: number; kunto: string; divari: string; instanssiIdt: string[] }>
					)
				);
				this.instanssit = this.jarjestaData(ryhmitettyData);
			},
			error: (error) => {
				this.notificationService.newNotification('error', error.message);
			},
		});
	}

	// Järjestää teosinstanssit hinnan, kunnon ja divarin nimen mukaan
	jarjestaData(data: any[]) {
		const jarjestettyData = data.sort((a, b) => {
			if (a.hinta !== b.hinta) {
				return a.hinta - b.hinta;
			}
			if (this.kuntoLajittelu[a.kunto] !== this.kuntoLajittelu[b.kunto]) {
				return this.kuntoLajittelu[b.kunto] - this.kuntoLajittelu[a.kunto];
			}
			return a.divari.localeCompare(b.divari);
		});
		return jarjestettyData;
	}

	// Lisää teosinstanssi ostoskoriin
	lisaaOstoskoriin = async (instanssi: any) => {
		// Tarkista, että käyttäjä on valinnut teoksen
		if (this.valittuTeos) {
			const valittuTeos = { ...this.valittuTeos };

			// Valitse ensimmäinen instanssi ID
			let instanssiId = instanssi.instanssiIdt[0];

			const id = await this.bookService.postLisaaInstanssiOstoskoriin(instanssiId).toPromise();
			instanssiId = id; // Käytä palvelimen palauttamaa idtä

			// Jos null, ei vapaita instansseja
			if (!instanssiId) {
				return;
			}

			const ostoskoriTuote: OstoskoriTuote = {
				id: Math.floor(Math.random() * 1000),
				teos: valittuTeos,
				teosInstanssi: {
					hinta: instanssi.hinta,
					kunto: instanssi.kunto,
					divari: instanssi.divari,
					teosInstanssiId: instanssiId,
				},
			};
			// Lisää ostoskoriin ja näytä ilmoitus
			this.store.dispatch(addToCart({ item: ostoskoriTuote }));
			this.notificationService.newNotification('success', `Tuote "${ostoskoriTuote.teos.nimi}" lisätty ostoskoriin`);
		} else {
			this.notificationService.newNotification('error', 'Ei valittua teosta');
		}
	};
}
