import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivariComponent } from './divari.component';

describe('DivariComponent', () => {
	let component: DivariComponent;
	let fixture: ComponentFixture<DivariComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DivariComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DivariComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
