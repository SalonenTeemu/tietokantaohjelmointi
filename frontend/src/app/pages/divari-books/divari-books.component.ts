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
export class DivariBooksComponent implements OnInit {
	instanceFormGroup: FormGroup;
	saatavillaOlevatTeokset: any[] = [];
	teokset: any[] = [];
	valittuTeos: string | null = null;
	kayttaja!: Kayttaja | null;
	naytaSaatavatTeokset = false;

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

	ngOnInit() {
		if (!this.kayttaja) {
			return;
		}
		this.lataaTeokset();
	}

	lisaaTeos() {
		this.router.navigate(['/uusiteos']);
	}

	paivitaTeosLkm(lkm: number) {
		if (this.valittuTeos) {
			const teos = this.teokset.find((teos) => teos.teosId === this.valittuTeos);
			if (teos) {
				teos.instanssi_lkm += lkm;
			}
		}
	}

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

	lataaKaikkiTeokset() {
		this.bookService.getKaikkiTeokset().subscribe((teokset) => {
			const filteredTeokset = teokset.filter((teos) => {
				return !this.teokset.some((divarinTeos) => divarinTeos.teosId === teos.teosId);
			});
			this.saatavillaOlevatTeokset = filteredTeokset;
		});
	}

	naytaKaikkiTeokset() {
		this.naytaSaatavatTeokset = !this.naytaSaatavatTeokset;
		if (this.naytaSaatavatTeokset) {
			this.lataaKaikkiTeokset();
			this.valittuTeos = null;
		}
	}

	valitseTeos(teosId: string) {
		if (this.valittuTeos === teosId) {
			this.valittuTeos = null;
			return;
		}
		this.valittuTeos = teosId;
	}

	lisaaInstanssi() {
		const instanssi = { divariId: this.kayttaja?.divariId, teosId: this.valittuTeos, ...this.instanceFormGroup.value };
		if (!instanssi.sisaanostohinta) {
			delete instanssi.sisaanostohinta;
		}
		if (!instanssi.kunto) {
			delete instanssi.kunto;
		}
		const tarkistus = tarkistaInstanssiLisäys(instanssi);
		if (!tarkistus.success && tarkistus.message) {
			this.notificationService.newNotification('error', tarkistus.message);
			return;
		}
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
