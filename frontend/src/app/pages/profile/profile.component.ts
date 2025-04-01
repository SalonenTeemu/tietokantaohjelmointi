import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { OrderService } from '../../services/order.service';
import { Kayttaja } from '../../models/kayttaja';
import { selectUser } from '../../store/selectors/auth.selector';
import { NotificationService } from '../../services/notification.service';

@Component({
	selector: 'app-profile',
	imports: [CommonModule],
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
	kayttaja!: Kayttaja | null;
	tilaukset: any[] = []; // Käyttäjän tilaukset

	constructor(
		private store: Store,
		private orderService: OrderService,
		private notificationService: NotificationService
	) {}

	ngOnInit() {
		this.store.select(selectUser).subscribe((user) => {
			this.kayttaja = user;
		});
		if (this.kayttaja) {
			this.haeTilaukset();
		}
	}

	// Hae käyttäjän tilaukset palvelimelta
	haeTilaukset() {
		this.orderService.getTilaukset().subscribe((tilaukset) => {
			if (tilaukset) {
				this.tilaukset = tilaukset as any[];
			} else {
				this.notificationService.newNotification('error', 'Tilauksien haku epäonnistui');
				console.error('Tilauksien haku epäonnistui');
			}
		});
	}
}
