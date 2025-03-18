import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeskusdivariComponent } from './keskusdivari.component';

describe('KeskusdivariComponent', () => {
	let component: KeskusdivariComponent;
	let fixture: ComponentFixture<KeskusdivariComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [KeskusdivariComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(KeskusdivariComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
