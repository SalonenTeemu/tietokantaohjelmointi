import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { SearchComponent } from './pages/search/search.component';
import { CartComponent } from './pages/cart/cart.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { OrderOverviewComponent } from './pages/order-overview/order-overview.component';
import { OrderConfirmedComponent } from './pages/order-confirmed/order-confirmed.component';
import { NewBookComponent } from './pages/new-book/new-book.component';
import { DivariBooksComponent } from './pages/divari-books/divari-books.component';
import { DivariComponent } from './pages/divari/divari.component';
import { DivariReportsComponent } from './pages/divari-reports/divari-reports.component';
import { KeskusdivariComponent } from './pages/keskusdivari/keskusdivari.component';
import { KeskusdivariReportsComponent } from './pages/keskusdivari-reports/keskusdivari-reports.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

// Sovelluksen reititys, jossa myös määritellään niiden suojaus roolien mukaan
export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{
		path: 'tilaus',
		component: OrderOverviewComponent,
		canActivate: [AuthGuard],
		data: { roles: ['asiakas', 'divariAdmin', 'admin'] },
	},
	{ path: 'ostoskori', component: CartComponent },
	{
		path: 'tilaus/vahvistettu',
		component: OrderConfirmedComponent,
		canActivate: [AuthGuard],
		data: { roles: ['asiakas', 'divariAdmin', 'admin'] },
	},
	{ path: 'kirjaudu', component: LoginComponent },
	{ path: 'rekisteroidy', component: RegisterComponent },
	{ path: 'hae', component: SearchComponent },
	{ path: 'divari', component: DivariComponent, canActivate: [AuthGuard], data: { roles: ['divariAdmin'] } },
	{ path: 'divari/raportit', component: DivariReportsComponent, canActivate: [AuthGuard], data: { roles: ['divariAdmin'] } },
	{ path: 'divari/teokset', component: DivariBooksComponent, canActivate: [AuthGuard], data: { roles: ['divariAdmin'] } },
	{ path: 'keskusdivari', component: KeskusdivariComponent, canActivate: [AuthGuard], data: { roles: ['admin'] } },
	{ path: 'keskusdivari/raportit', component: KeskusdivariReportsComponent, canActivate: [AuthGuard], data: { roles: ['admin'] } },
	{ path: 'uusiteos', component: NewBookComponent, canActivate: [AuthGuard], data: { roles: ['divariAdmin', 'admin'] } },
	{ path: '**', component: NotFoundComponent },
];
