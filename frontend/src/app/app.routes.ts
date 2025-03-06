import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SearchComponent } from './pages/search/search.component';
import { CartComponent } from './pages/cart/cart.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { OrderOverviewComponent } from './pages/order-overview/order-overview.component';
import { OrderConfirmedComponent } from './pages/order-confirmed/order-confirmed.component';
import { NewBookComponent } from './pages/new-book/new-book.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'tilaus', component: OrderOverviewComponent },
	{ path: 'ostoskori', component: CartComponent },
	{ path: 'tilaus/vahvistettu', component: OrderConfirmedComponent },
	{ path: 'kirjaudu', component: LoginComponent },
	{ path: 'rekisteröidy', component: RegisterComponent },
	{ path: 'hae', component: SearchComponent },
	{ path: 'uusi/teos', component: NewBookComponent },
];
