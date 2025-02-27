import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addToCart } from '../../store/actions/cart.actions';
import { Teos } from '../../models/teos';
import { TeosInstanssi } from '../../models/teosInstanssi';
import { BookService } from '../../services/book.service';

@Component({
	selector: 'app-search',
	standalone: true,
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	imports: [CommonModule, FormsModule],
})
export class SearchComponent {
	queryNimi = '';
	queryTekija = '';
	queryTyyppi = '';
	queryLuokka = '';

	teokset: Teos[] = [];
	valittuTeos: Teos | null = null;
	instanssit: TeosInstanssi[] = [];
	errorMessage = '';

	constructor(
		private bookService: BookService,
		private store: Store
	) {}

	onSearch() {
		this.errorMessage = ''; // Nollataan virhe ennen uutta hakua
		this.bookService
			.haeTeokset({
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
					this.errorMessage = error.message;
				},
			});
	}

	haeTeosInstanssit(teos: Teos) {
		this.errorMessage = '';
		this.valittuTeos = teos;
		this.bookService.getTeosInstanssit(teos.teosId).subscribe({
			next: (data: TeosInstanssi[]) => {
				this.instanssit = data;
			},
			error: (error) => {
				this.errorMessage = error.message;
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
			this.errorMessage = 'Ei valittua teosta.';
		}
	}
}
