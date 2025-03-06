import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OstoskoriTuote } from '../../models/ostoskoriTuote';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-order-confirmed',
	imports: [CommonModule],
	templateUrl: './order-confirmed.component.html',
	styleUrl: './order-confirmed.component.css',
	standalone: true,
})
export class OrderConfirmedComponent {
	tuotteet: OstoskoriTuote[];
	shipping: number;
	total: number;

	constructor(private router: Router) {
		const navigation = this.router.getCurrentNavigation();
		const state = navigation?.extras.state || {};
		this.tuotteet = state['tuotteet'] || [];
		this.shipping = state['shipping'] || 0;
		this.total = state['total'] || 0;
	}

	navigateToHome() {
		this.router.navigate(['/']);
	}
}
