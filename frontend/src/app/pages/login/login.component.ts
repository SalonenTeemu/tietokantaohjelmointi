import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
		private router: Router
	) {
		this.loginForm = this.fb.group({
			email: [''],
			salasana: [''],
		});
	}

	onLogin() {
		const { email, salasana } = this.loginForm.value;
		this.authService.login(email, salasana).subscribe((success: boolean) => {
			if (success) {
				this.router.navigate(['/search']);
				alert('Kirjautuminen onnistui');
			} else {
				alert('Virheellinen sähköposti tai salasana');
			}
		});
	}
}
