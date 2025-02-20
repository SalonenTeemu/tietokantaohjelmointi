import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addToCart } from '../../store/actions/cart.actions';
//import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
	selector: 'app-search',
	standalone: true,
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	imports: [CommonModule, FormsModule],
})
export class SearchComponent {
	query = '';
	books: Book[] = [];

	constructor(
		/*private bookService: BookService,*/ private router: Router,
		private store: Store
	) {}

	onSearch() {
		/*this.bookService.searchBooks(this.query).subscribe((data: any) => {
		this.books = data;
	}); */
		this.books = [
			{
				id: 1,
				title: 'Book 1',
				author: 'Author 1',
				year: 2021,
				price: 10,
				quantity: 1,
			},
		];
	}

	addToCart(book: Book) {
		this.store.dispatch(addToCart({ item: { id: book.id, title: book.title, price: book.price, quantity: 1 } }));
	}
}
