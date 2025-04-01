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
// Komponentti, joka näyttää tilauksen vahvistussivun
export class OrderConfirmedComponent {
	tuotteet: OstoskoriTuote[];
	toimituskulut: number;
	yhteensa: number;

	// Rakentaja alustaa tuotteet, toimituskulut ja yhteensä arvot tilauksen vahvistussivulle
	constructor(private router: Router) {
		const navigation = this.router.getCurrentNavigation();
		const state = navigation?.extras.state || {};
		this.tuotteet = state['tuotteet'] || [];
		this.toimituskulut = state['toimituskulut'] || 0;
		this.yhteensa = state['yhteensa'] || 0;
	}

	// Navigointi etusivulle
	siirryEtusivulle() {
		this.router.navigate(['/']);
	}
}
