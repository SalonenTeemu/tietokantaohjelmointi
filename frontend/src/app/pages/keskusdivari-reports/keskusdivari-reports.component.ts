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
export class KeskusdivariReportsComponent implements OnInit {
	raportti: any[] = [];
	kayttaja!: Kayttaja | null;
	openIndexes: number[] = [];

	constructor(
		private reportService: ReportService,
		private store: Store,
		private cdr: ChangeDetectorRef
	) {
		this.store.select(selectUser).subscribe((user) => {
			this.kayttaja = user;
		});
	}

	ngOnInit() {
		this.lataaTeokset();
	}

	lataaTeokset() {
		if (!this.kayttaja) {
			return;
		}
		this.reportService.getKeskusdivariLuokkaRaportti().subscribe((raportti: any[]) => {
			this.raportti = raportti;
		});
	}

	toggleLuokka(index: number): void {
		if (this.openIndexes.includes(index)) {
			this.openIndexes = this.openIndexes.filter((i) => i !== index);
		} else {
			this.openIndexes.push(index);
		}
		this.cdr.detectChanges();
	}

	lataaRaportti(): void {
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
