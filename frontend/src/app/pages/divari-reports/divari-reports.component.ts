import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { Kayttaja } from '../../models/kayttaja';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/selectors/auth.selector';

@Component({
	selector: 'app-divari-reports',
	imports: [CommonModule, RouterModule],
	templateUrl: './divari-reports.component.html',
	styleUrl: './divari-reports.component.css',
})

//Divarin raporttisivun komponentti, joka näyttää divarin luokkaraportin
export class DivariReportsComponent implements OnInit {
	raportti: any[] = [];
	kayttaja!: Kayttaja | null;
	openIndexes: number[] = [];

	// Rakentaja alustaa käyttäjän ja raporttipalvelun
	constructor(
		private reportService: ReportService,
		private store: Store,
		private cdr: ChangeDetectorRef
	) {
		this.store.select(selectUser).subscribe((user) => {
			this.kayttaja = user;
		});
	}

	// Lataa raportin kun komponentti alustuu
	ngOnInit() {
		this.lataaRaportti();
	}

	// Lataa raportti käyttäjän divariId:llä
	lataaRaportti() {
		if (!this.kayttaja || !this.kayttaja.divariId) {
			return;
		}
		this.reportService.getDivariLuokkaRaportti(this.kayttaja?.divariId).subscribe((raportti: any[]) => {
			this.raportti = raportti;
		});
	}

	// Piilottaa tai näyttää luokan raportin
	toggleLuokka(index: number): void {
		if (this.openIndexes.includes(index)) {
			this.openIndexes = this.openIndexes.filter((i) => i !== index);
		} else {
			this.openIndexes.push(index);
		}
		this.cdr.detectChanges();
	}
}
