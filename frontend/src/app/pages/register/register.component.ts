import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
		private router: Router
	) {
		this.registerForm = this.fb.group({
			nimi: [''],
			email: [''],
			puhelin: [''],
			osoite: [''],
			salasana: [''],
		});
	}

	onRegister() {
		const { nimi, email, puhelin, osoite, salasana } = this.registerForm.value;
		this.authService.register(nimi, email, puhelin, osoite, salasana).subscribe((success: boolean) => {
			if (success) {
				alert('Rekisteröityminen onnistui');
				this.router.navigate(['/kirjaudu']);
			} else {
				alert('Rekisteröityminen epäonnistui');
			}
		});
	}
}
