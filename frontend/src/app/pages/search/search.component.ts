import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addToCart } from '../../store/actions/cart.actions';
import { Teos } from '../../models/teos';
import { TeosInstanssi } from '../../models/teosInstanssi';
import { BookService } from '../../services/book.service';
import { tarkistaHaku } from '../../utils/validate';

@Component({
	selector: 'app-search',
	standalone: true,
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	imports: [CommonModule, FormsModule],
})
export class SearchComponent implements OnInit {
	luokat: any[] = [];
	tyypit: any[] = [];
	queryNimi = '';
	queryTekija = '';
	queryTyyppi = '';
	queryLuokka = '';

	teokset: Teos[] = [];
	valittuTeos: Teos | null = null;
	instanssit: TeosInstanssi[] = [];
	virheViesti = '';

	constructor(
		private bookService: BookService,
		private store: Store
	) {}

	ngOnInit() {
		this.lataaLuokatjaTyypit();
	}

	lataaLuokatjaTyypit() {
		this.bookService.getTeosLuokat().subscribe((luokat: any[]) => {
			this.luokat = luokat;
		});
		this.bookService.getTeosTyypit().subscribe((tyypit: any[]) => {
			this.tyypit = tyypit;
		});
	}

	haeTeoksia() {
		this.virheViesti = ''; // Nollataan virhe ennen uutta hakua
		// Jos haku on tyhjä, hae kaikki teokset
		if (!tarkistaHaku(this.queryNimi, this.queryTekija, this.queryLuokka, this.queryTyyppi)) {
			this.bookService.getKaikkiTeokset().subscribe({
				next: (data: Teos[]) => {
					this.teokset = data;
					this.valittuTeos = null;
					this.instanssit = [];
				},
				error: (error) => {
					this.virheViesti = error.message;
				},
			});
			return;
		}
		this.bookService
			.getTeokset({
				nimi: this.queryNimi,
				tekija: this.queryTekija,
				tyyppi: this.queryTyyppi,
				luokka: this.queryLuokka,
			})
			.subscribe({
				next: (data: Teos[]) => {
					this.teokset = data;
					this.valittuTeos = null;
					this.instanssit = [];
				},
				error: (error) => {
					this.virheViesti = error.message;
				},
			});
	}

	haeTeosInstanssit(teos: Teos) {
		this.virheViesti = '';
		this.valittuTeos = teos;
		this.bookService.getTeosInstanssit(teos.teosId).subscribe({
			next: (data: TeosInstanssi[]) => {
				this.instanssit = data;
			},
			error: (error) => {
				this.virheViesti = error.message;
			},
		});
	}

	lisaaOstoskoriin(instanssi: TeosInstanssi) {
		if (this.valittuTeos) {
			const ostoskoriTuote = {
				id: Math.floor(Math.random() * 1000),
				teos: this.valittuTeos,
				teosInstanssi: instanssi,
			};
			this.store.dispatch(addToCart({ item: ostoskoriTuote }));
		} else {
			this.virheViesti = 'Ei valittua teosta.';
		}
	}
}
