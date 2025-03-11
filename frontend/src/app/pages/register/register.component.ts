import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tarkistaRekisteroityminen } from '../../utils/validate';
import { NotificationService } from '../../services/notification.service';

@Component({
	selector: 'app-register',
	imports: [RouterModule, ReactiveFormsModule],
	templateUrl: './register.component.html',
	styleUrl: './register.component.css',
	standalone: true,
})
export class RegisterComponent {
	registerForm: FormGroup;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private notificationService: NotificationService
	) {
		this.registerForm = this.fb.group({
			nimi: [''],
			email: [''],
			puhelin: [''],
			osoite: [''],
			salasana: [''],
		});
	}

	rekisteroidy() {
		const { nimi, email, puhelin, osoite, salasana } = this.registerForm.value;
		const tarkistus = tarkistaRekisteroityminen(nimi, email, puhelin, osoite, salasana);
		if (!tarkistus.success) {
			this.notificationService.newNotification('error', tarkistus.message);
			return;
		}
		this.authService.postRekisteroidy(nimi, email, puhelin, osoite, salasana).subscribe((success: boolean) => {
			if (success) {
				this.notificationService.newNotification('success', 'Rekisteröityminen onnistui');
				this.router.navigate(['/kirjaudu']);
			} else {
				this.notificationService.newNotification('error', 'Rekisteröityminen epäonnistui');
			}
		});
	}
}
