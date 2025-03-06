import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirmedComponent } from './order-confirmed.component';

describe('OrderConfirmedComponent', () => {
	let component: OrderConfirmedComponent;
	let fixture: ComponentFixture<OrderConfirmedComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OrderConfirmedComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(OrderConfirmedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
