import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivariBooksComponent } from './divari-books.component';

describe('DivariBooksComponent', () => {
	let component: DivariBooksComponent;
	let fixture: ComponentFixture<DivariBooksComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DivariBooksComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DivariBooksComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
