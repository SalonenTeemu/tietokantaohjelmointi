import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
	imports: [FormsModule],
})
export class LoginComponent {
	username = '';
	password = '';

	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	onLogin() {
		this.authService.login(this.username, this.password).subscribe((success) => {
			if (success) {
				this.router.navigate(['/search']);
				alert('Kirjautuminen onnistui');
			} else {
				alert('Virheellinen käyttäjätunnus tai salasana');
			}
		});
	}
}
