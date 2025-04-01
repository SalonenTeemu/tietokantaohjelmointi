import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { Kayttaja } from '../../models/kayttaja';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/selectors/auth.selector';

@Component({
	selector: 'app-keskusdivari-reports',
	imports: [CommonModule, RouterModule],
	templateUrl: './keskusdivari-reports.component.html',
	styleUrl: './keskusdivari-reports.component.css',
})
// Keskusdivarin raporttisivun komponentti
export class KeskusdivariReportsComponent implements OnInit {
	raportti: any[] = [];
	kayttaja!: Kayttaja | null;
	avatut: number[] = [];

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

	// Lataa luokkaraportin kun komponentti alustuu
	ngOnInit() {
		this.lataaLuokkaRaportti();
	}

	// Lataa luokkaraportti, jos käyttäjä on kirjautunut
	lataaLuokkaRaportti() {
		if (!this.kayttaja) {
			return;
		}
		this.reportService.getKeskusdivariLuokkaRaportti().subscribe((raportti: any[]) => {
			this.raportti = raportti;
		});
	}

	// Piilottaa tai näyttää luokan raportin
	toggleLuokka(indeksi: number): void {
		if (this.avatut.includes(indeksi)) {
			this.avatut = this.avatut.filter((i) => i !== indeksi);
		} else {
			this.avatut.push(indeksi);
		}
		this.cdr.detectChanges();
	}

	// Lataa CSV-asiakasraportin, joka sisältää kaikki asiakkaat ja heidän tietonsa
	lataaAsiakasRaportti(): void {
		this.reportService.getKeskusdivariAsiakasRaportti().subscribe((blob: Blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'asiakasraportti_viime_vuosi.csv';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		});
	}
}
