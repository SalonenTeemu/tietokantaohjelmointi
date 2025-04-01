import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tarkistaTeoksenLisäys } from '../../utils/validate';
import { BookService } from '../../services/book.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectLuokat, selectTyypit } from '../../store/selectors/category.selector';
import { NotificationService } from '../../services/notification.service';
import { Location } from '@angular/common';

@Component({
	selector: 'app-new-book',
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	templateUrl: './new-book.component.html',
	styleUrl: './new-book.component.css',
	standalone: true,
})
// Uuden teoksen lisäämisen komponentti
export class NewBookComponent {
	bookFormGroup: FormGroup;
	tyypit$: Observable<{ tyyppiId: number; nimi: string }[]>;
	luokat$: Observable<{ luokkaId: number; nimi: string }[]>;

	// Rakentaja alustaa tyypit, luokat, lomakkeen ja palvelut
	constructor(
		private fb: FormBuilder,
		private bookService: BookService,
		private store: Store,
		private notificationService: NotificationService,
		private location: Location
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
		this.luokat$ = this.store.select(selectLuokat);
		this.tyypit$ = this.store.select(selectTyypit);
	}

	// Lisää uusi teos keskusdivariin
	lisaaTeos() {
		const { nimi, isbn, tekija, tyyppiId, luokkaId, julkaisuvuosi, paino } = this.bookFormGroup.value;
		// Tarkista käyttäjän syöte
		const tarkistus = tarkistaTeoksenLisäys(nimi, isbn, tekija, tyyppiId, luokkaId, julkaisuvuosi, paino);
		if (!tarkistus.success && tarkistus.message) {
			this.notificationService.newNotification('error', tarkistus.message);
			return;
		}
		this.bookService.postLisaaTeos(this.bookFormGroup.value).subscribe((success: boolean) => {
			if (success) {
				this.notificationService.newNotification('success', 'Teoksen lisäys onnistui');
			} else {
				this.notificationService.newNotification('error', 'Teoksen lisäys epäonnistui');
			}
		});
	}

	palaaTakaisin() {
		this.location.back();
	}
}
