import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { UserWizardComponent } from './pages/user-wizard/user-wizard';
import { UserDatatableComponent } from './pages/user-datatable/user-datatable';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent }, // Ruta para el dashboard
  { path: 'user-wizard', component: UserWizardComponent },
  { path: 'user-datatable', component: UserDatatableComponent },
  // Agrega aquí una ruta para el registro si la necesitas
  // { path: 'register', component: RegisterComponent },
];
