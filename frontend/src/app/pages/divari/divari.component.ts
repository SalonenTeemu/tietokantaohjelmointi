import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-divari',
	imports: [RouterModule, CommonModule],
	templateUrl: './divari.component.html',
	styleUrl: './divari.component.css',
})

// Divari komponentti, jossa linkit divariin liittyviin toimintoihin
export class DivariComponent {}
