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
	instanssit: TeosInstanssi[] = [];

	// Rakentaja alustaa tyypit, luokat, palvelut ja tilat reduxista
	constructor(
		private bookService: BookService,
		private store: Store,
		private notificationService: NotificationService
	) {
		this.luokat$ = store.select(selectLuokat);
		this.tyypit$ = store.select(selectTyypit);
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
				this.instanssit = data;
			},
			error: (error) => {
				this.notificationService.newNotification('error', error.message);
			},
		});
	}

	// Lisää teosinstanssi ostoskoriin
	lisaaOstoskoriin(instanssi: TeosInstanssi) {
		// Tarkista, että käyttäjä on valinnut teoksen
		if (this.valittuTeos) {
			// Tee ostoskoriTuote ja lisää se ostoskoriin
			const ostoskoriTuote: OstoskoriTuote = {
				id: Math.floor(Math.random() * 1000),
				teos: this.valittuTeos,
				teosInstanssi: instanssi,
			};
			// Lisää ostoskoriTuote redux-tilaan
			this.store.dispatch(addToCart({ item: ostoskoriTuote }));
			this.notificationService.newNotification('success', `Tuote "${ostoskoriTuote.teos.nimi}" lisätty ostoskoriin`);
		} else {
			this.notificationService.newNotification('error', 'Ei valittua teosta');
		}
	}
}
