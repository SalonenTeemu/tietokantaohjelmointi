import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-not-found',
	imports: [CommonModule, RouterModule],
	templateUrl: './not-found.component.html',
	styleUrl: './not-found.component.css',
})
// Komponentti, joka näyttää virhesivun, kun sivua ei löydy
export class NotFoundComponent implements OnInit {
	constructor(
		private router: Router,
		private notificationService: NotificationService
	) {}

	// Komponentin alustuksessa kertoo käyttäjälle, että sivua ei löytynyt ja ohjaa etusivulle 3 sekunnin jälkeen
	ngOnInit(): void {
		this.notificationService.newNotification('error', 'Sivua ei löytynyt.');
		setTimeout(() => {
			this.router.navigate(['/']);
		}, 3000);
	}
}
