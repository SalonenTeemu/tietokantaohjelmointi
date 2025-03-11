import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tarkistaTeoksenLisäys } from '../../utils/validate';
import { BookService } from '../../services/book.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectLuokat, selectTyypit } from '../../store/selectors/category.selector';

@Component({
	selector: 'app-new-book',
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	templateUrl: './new-book.component.html',
	styleUrl: './new-book.component.css',
	standalone: true,
})
export class NewBookComponent {
	bookFormGroup: FormGroup;
	tyypit$: Observable<{ tyyppiId: number; nimi: string }[]>;
	luokat$: Observable<{ luokkaId: number; nimi: string }[]>;

	constructor(
		private fb: FormBuilder,
		private bookService: BookService,
		private store: Store
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
		this.luokat$ = store.select(selectLuokat);
		this.tyypit$ = store.select(selectTyypit);
	}

	lisaaTeos() {
		const { nimi, isbn, tekija, tyyppiId, luokkaId, julkaisuvuosi, paino } = this.bookFormGroup.value;

		const tarkistus = tarkistaTeoksenLisäys(nimi, isbn, tekija, tyyppiId, luokkaId, julkaisuvuosi, paino);
		if (!tarkistus.success) {
			alert(tarkistus.message);
			return;
		}
		this.bookService.postLisaaTeos(this.bookFormGroup.value).subscribe((success: boolean) => {
			if (success) {
				alert('Teoksen lisäys onnistui');
			} else {
				alert('Teoksen lisäys epäonnistui');
			}
		});
	}
}
