import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addToCart } from '../../store/actions/cart.actions';
//import { BookService } from '../../services/book.service';
import { TeosInstanssi } from '../../models/teosInstanssi';

@Component({
	selector: 'app-search',
	standalone: true,
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	imports: [CommonModule, FormsModule],
})
export class SearchComponent {
	query = '';
	teokset: TeosInstanssi[] = [];

	constructor(
		/*private bookService: BookService,*/ private router: Router,
		private store: Store
	) {}

	onSearch() {
		/*this.bookService.searchBooks(this.query).subscribe((data: any) => {
		this.books = data;
	}); */
		this.teokset = [
			{
				teosInstanssiId: '1',
				hinta: 10,
				kunto: 'hyvä',
				divari: {
					divariId: 1,
					nimi: 'Divari',
					osoite: 'Osoite',
					webSivu: 'www.divari.fi',
				},
				teos: {
					teosId: '1',
					nimi: 'Teos',
					tekija: 'Tekijä',
					julkaisuvuosi: 2021,
					paino: 100,
					luokka: 'Luokka',
					tyyppi: 'Tyyppi',
				},
			},
		];
	}

	addToCart(teos: TeosInstanssi) {
		//this.store.dispatch(addToCart(
	}
}
