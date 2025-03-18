import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivariRaportitComponent } from './divari-raportit.component';

describe('DivariRaportitComponent', () => {
	let component: DivariRaportitComponent;
	let fixture: ComponentFixture<DivariRaportitComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DivariRaportitComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DivariRaportitComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
