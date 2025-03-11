import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Kayttaja } from '../../models/kayttaja';
import { tarkistaInstanssiLisäys } from '../../utils/validate';

@Component({
	selector: 'app-divari-books',
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './divari-books.component.html',
	styleUrl: './divari-books.component.css',
})
export class DivariBooksComponent implements OnInit {
	instanceFormGroup: FormGroup;
	teokset: any[] = [];
	valittuTeos: string | null = null;
	kayttaja: Kayttaja | null;

	constructor(
		private bookService: BookService,
		private fb: FormBuilder,
		private authService: AuthService
	) {
		this.kayttaja = this.authService.haeKayttaja();
		this.instanceFormGroup = this.fb.group({
			hinta: [''],
			kpl: [''],
			kunto: [''],
			sisaanostohinta: [''],
		});
	}

	ngOnInit() {
		this.lataaTeokset();
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
				console.error('Invalid divariId');
				return;
			}
			this.bookService.getDivarinTeokset(divariIdNum).subscribe((teokset: any[]) => {
				this.teokset = teokset;
			});
		} else {
			console.error('Käyttäjä ei divari admin tai ei kirjautunut');
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
		if (!tarkistus.success) {
			alert(tarkistus.message);
			return;
		}
		this.bookService.postLisaaTeosInstanssi(instanssi).subscribe((success: boolean) => {
			if (success) {
				this.paivitaTeosLkm(instanssi.kpl);
				alert('Teoksen lisäys onnistui');
			} else {
				alert('Teoksen lisäys epäonnistui');
			}
		});
	}
}
