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

@Component({
	selector: 'app-search',
	standalone: true,
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
	imports: [CommonModule, FormsModule],
})
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

	constructor(
		private bookService: BookService,
		private store: Store,
		private notificationService: NotificationService
	) {
		this.luokat$ = store.select(selectLuokat);
		this.tyypit$ = store.select(selectTyypit);
	}

	haeTeoksia() {
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

					if (this.teokset.length === 0) {
						this.notificationService.newNotification('error', 'Ei hakutuloksia');
					}
				},
				error: (error) => {
					this.notificationService.newNotification('error', error.message);
				},
			});
	}

	haeTeosInstanssit(teos: Teos) {
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

	lisaaOstoskoriin(instanssi: TeosInstanssi) {
		if (this.valittuTeos) {
			const ostoskoriTuote = {
				id: Math.floor(Math.random() * 1000),
				teos: this.valittuTeos,
				teosInstanssi: instanssi,
			};
			this.store.dispatch(addToCart({ item: ostoskoriTuote }));
			this.notificationService.newNotification('success', `Tuote "${ostoskoriTuote.teos.nimi}" lisätty ostoskoriin`);
		} else {
			this.notificationService.newNotification('error', 'Ei valittua teosta');
		}
	}
}
