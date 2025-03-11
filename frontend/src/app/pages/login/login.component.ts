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
export class LoginComponent {
	loginForm: FormGroup;

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

	kirjaudu() {
		const { email, salasana } = this.loginForm.value;
		const tarkistus = tarkistaKirjautuminen(email, salasana);
		if (!tarkistus.success) {
			this.notificationService.newNotification('error', tarkistus.message);
			return;
		}
		this.authService.postKirjaudu(email, salasana).subscribe((success: boolean) => {
			if (success) {
				this.router.navigate(['/']);
				this.notificationService.newNotification('success', 'Kirjautuminen onnistui');
			} else {
				this.notificationService.newNotification('error', 'Virheellinen sähköposti tai salasana');
			}
		});
	}
}
