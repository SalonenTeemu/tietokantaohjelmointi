import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SearchComponent } from './pages/search/search.component';
import { CartComponent } from './pages/cart/cart.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'kirjaudu', pathMatch: 'full' },
	{ path: 'kirjaudu', component: LoginComponent },
	{ path: 'hae', component: SearchComponent },
	{ path: 'ostoskori', component: CartComponent },
];
