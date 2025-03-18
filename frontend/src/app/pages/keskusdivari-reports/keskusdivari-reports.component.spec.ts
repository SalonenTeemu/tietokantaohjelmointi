import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeskusdivariReportsComponent } from './keskusdivari-reports.component';

describe('KeskusdivariReportsComponent', () => {
	let component: KeskusdivariReportsComponent;
	let fixture: ComponentFixture<KeskusdivariReportsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [KeskusdivariReportsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(KeskusdivariReportsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
