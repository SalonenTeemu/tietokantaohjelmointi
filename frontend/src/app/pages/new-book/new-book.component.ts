import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tarkistaTeoksenLisäys } from '../../utils/validate';
import { BookService } from '../../services/book.service';
import { Luokka, Tyyppi } from '../../models/luokkaTyyppi';

@Component({
	selector: 'app-new-book',
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	templateUrl: './new-book.component.html',
	styleUrl: './new-book.component.css',
	standalone: true,
})
export class NewBookComponent implements OnInit {
	bookFormGroup: FormGroup;
	luokat: Luokka[] = [];
	tyypit: Tyyppi[] = [];

	constructor(
		private fb: FormBuilder,
		private bookService: BookService
	) {
		this.bookFormGroup = this.fb.group({
			nimi: [''],
			isbn: [''],
			tekija: [''],
			tyyppiId: [''],
			luokkaId: [''],
			julkaisuvuosi: [''],
			paino: [''],
		});
	}

	ngOnInit() {
		this.loadUtils();
	}

	loadUtils() {
		this.bookService.haeTeosLuokat().subscribe((luokat: Luokka[]) => {
			this.luokat = luokat;
		});
		this.bookService.haeTeosTyypit().subscribe((tyypit: Tyyppi[]) => {
			this.tyypit = tyypit;
		});
	}

	onSubmitBook() {
		const { nimi, isbn, tekija, tyyppiId, luokkaId, julkaisuvuosi, paino } = this.bookFormGroup.value;

		const tarkistus = tarkistaTeoksenLisäys(nimi, isbn, tekija, tyyppiId, luokkaId, julkaisuvuosi, paino);
		if (!tarkistus.success) {
			alert(tarkistus.message);
			return;
		}
		this.bookService.lisaaTeos(this.bookFormGroup.value).subscribe((success: boolean) => {
			if (success) {
				alert('Teoksen lisäys onnistui');
			} else {
				alert('Teoksen lisäys epäonnistui');
			}
		});
	}
}
