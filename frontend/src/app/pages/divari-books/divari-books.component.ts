import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Kayttaja } from '../../models/kayttaja';
import { tarkistaInstanssiLisäys } from '../../utils/validate';
import { NotificationService } from '../../services/notification.service';
import { selectUser } from '../../store/selectors/auth.selector';
import { Router, RouterLink } from '@angular/router';

@Component({
	selector: 'app-divari-books',
	imports: [CommonModule, ReactiveFormsModule, RouterLink],
	templateUrl: './divari-books.component.html',
	styleUrl: './divari-books.component.css',
})

// Divarin teosten komponentti, jossa divari admin voi lisätä teosinstansseja
export class DivariBooksComponent implements OnInit {
	instanceFormGroup: FormGroup;
	saatavillaOlevatTeokset: any[] = [];
	teokset: any[] = [];
	valittuTeos: string | null = null;
	kayttaja!: Kayttaja | null;
	naytaSaatavatTeokset = false;

	// Rakentaja alustaa käyttäjän, palvelut ja lomakkeen
	constructor(
		private bookService: BookService,
		private fb: FormBuilder,
		private store: Store,
		private notificationService: NotificationService,
		private router: Router
	) {
		this.store.select(selectUser).subscribe((user) => {
			this.kayttaja = user;
		});
		this.instanceFormGroup = this.fb.group({
			hinta: [''],
			kpl: [''],
			kunto: [''],
			sisaanostohinta: [''],
		});
	}

	// Lataa teokset kun komponentti alustuu, jos käyttäjä on kirjautunut
	ngOnInit() {
		if (!this.kayttaja) {
			return;
		}
		this.lataaTeokset();
	}

	// Navigointi uuden teoksen lisäämissivulle
	lisaaTeos() {
		this.router.navigate(['/uusiteos']);
	}

	// Päivitää valitun teoksen instanssin lukumäärän
	paivitaTeosLkm(lkm: number) {
		if (this.valittuTeos) {
			const teos = this.teokset.find((teos) => teos.teosId === this.valittuTeos);
			if (teos) {
				teos.instanssi_lkm += lkm;
			}
		}
	}

	// Ladaa divarin teokset käyttäjän divariId:n perusteella
	lataaTeokset() {
		if (this.kayttaja && this.kayttaja.divariId !== undefined) {
			const divariIdNum = Number(this.kayttaja.divariId);
			if (isNaN(divariIdNum)) {
				this.notificationService.newNotification('error', 'Virhe käyttäjän divariId:ssä');
				return;
			}
			this.bookService.getDivarinTeokset(divariIdNum).subscribe((teokset: any[]) => {
				this.teokset = teokset;
			});
		} else {
			this.notificationService.newNotification('error', 'Käyttäjä ei divari admin tai ei kirjautunut');
		}
	}

	// Lataa kaikki teokset, jotka eivät ole vielä divarissa
	lataaKaikkiTeokset() {
		this.bookService.getKaikkiTeokset().subscribe((teokset) => {
			const filteredTeokset = teokset.filter((teos) => {
				return !this.teokset.some((divarinTeos) => divarinTeos.teosId === teos.teosId);
			});
			this.saatavillaOlevatTeokset = filteredTeokset;
		});
	}

	// Näyttää tai piilottaa saatavilla olevat teokset
	naytaKaikkiTeokset() {
		this.naytaSaatavatTeokset = !this.naytaSaatavatTeokset;
		if (this.naytaSaatavatTeokset) {
			this.lataaKaikkiTeokset();
			this.valittuTeos = null;
		}
	}

	// Valitsee teoksen, jonka instanssia ollaan lisäämässä
	valitseTeos(teosId: string) {
		if (this.valittuTeos === teosId) {
			this.valittuTeos = null;
			return;
		}
		this.valittuTeos = teosId;
	}

	// Lisää teoksen instanssi divariin
	lisaaInstanssi() {
		const instanssi = { divariId: this.kayttaja?.divariId, teosId: this.valittuTeos, ...this.instanceFormGroup.value };
		if (!instanssi.sisaanostohinta) {
			delete instanssi.sisaanostohinta;
		}
		if (!instanssi.kunto) {
			delete instanssi.kunto;
		}
		// Tarkista instanssin formaatti
		const tarkistus = tarkistaInstanssiLisäys(instanssi);
		if (!tarkistus.success && tarkistus.message) {
			this.notificationService.newNotification('error', tarkistus.message);
			return;
		}
		// Lähetä instanssin lisäys
		this.bookService.postLisaaTeosInstanssi(instanssi).subscribe((success: boolean) => {
			if (success) {
				if (!this.teokset.some((teos) => teos.teosId === this.valittuTeos)) {
					this.lataaTeokset();
				} else {
					this.paivitaTeosLkm(instanssi.kpl);
				}
				this.notificationService.newNotification('success', 'Teoksen instanssin lisäys onnistui');
				this.valittuTeos = null;
				this.naytaSaatavatTeokset = false;
			} else {
				this.notificationService.newNotification('error', 'Teoksen intanssin lisäys epäonnistui');
			}
		});
	}
}
