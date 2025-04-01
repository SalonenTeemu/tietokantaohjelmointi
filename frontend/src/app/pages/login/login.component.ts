import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { tarkistaKirjautuminen } from '../../utils/validate';
import { NotificationService } from '../../services/notification.service';

@Component({
	selector: 'app-login',
	standalone: true,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
	imports: [FormsModule, RouterModule, ReactiveFormsModule],
})
//Kirjautumiskomponetti
export class LoginComponent {
	loginForm: FormGroup;

	// Rakentaja alustaa lomakkeen ja palvelut
	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private notificationService: NotificationService
	) {
		this.loginForm = this.fb.group({
			email: [''],
			salasana: [''],
		});
	}

	// Kirjaa käyttäjän sisään ja tarkistaa sähköpostin ja salasanan
	kirjaudu() {
		const { email, salasana } = this.loginForm.value;
		// Tarkista käyttäjän syöte
		const tarkistus = tarkistaKirjautuminen(email, salasana);
		if (!tarkistus.success) {
			this.notificationService.newNotification('error', tarkistus.message);
			return;
		}
		this.authService.postKirjaudu(email, salasana).subscribe((success: boolean) => {
			if (success) {
				// Ohjaa käyttäjä etusivulle onnistuneen kirjautumisen jälkeen
				this.router.navigate(['/']);
				this.notificationService.newNotification('success', 'Kirjautuminen onnistui');
			} else {
				this.notificationService.newNotification('error', 'Virheellinen sähköposti tai salasana');
			}
		});
	}
}
