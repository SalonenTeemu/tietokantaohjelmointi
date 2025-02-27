import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SearchComponent } from './pages/search/search.component';
import { CartComponent } from './pages/cart/cart.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { OrderOverviewComponent } from './pages/order-overview/order-overview.component';
//import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'tilaus', component: OrderOverviewComponent },
	//{ path: 'tilaus/vahvista', component: OrderConfirmationComponent },
	{ path: 'kirjaudu', component: LoginComponent },
	{ path: 'hae', component: SearchComponent },
	{ path: 'ostoskori', component: CartComponent },
	{ path: 'rekisteröidy', component: RegisterComponent },
];
