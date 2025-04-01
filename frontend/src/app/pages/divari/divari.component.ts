import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Kayttaja } from '../../models/kayttaja';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/selectors/auth.selector';

@Component({
	selector: 'app-divari',
	imports: [RouterModule, CommonModule],
	templateUrl: './divari.component.html',
	styleUrl: './divari.component.css',
})

// Divari komponentti, jossa linkit divariin liittyviin toimintoihin
export class DivariComponent implements OnInit {
	kayttaja!: Kayttaja | null;

	constructor(private store: Store) {}

	ngOnInit() {
		this.store.select(selectUser).subscribe((user) => {
			this.kayttaja = user;
		});
	}
}
