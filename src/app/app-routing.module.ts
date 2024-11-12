import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'role-selection', loadChildren: () => import('./pages/role-selection/role-selection.module').then(m => m.RoleSelectionPageModule) },
  { path: 'pasajero', loadChildren: () => import('./pages/pasajero/pasajero.module').then(m => m.PasajeroPageModule) },
  { path: 'conductor', loadChildren: () => import('./pages/conductor/conductor.module').then(m => m.ConductorPageModule) },
  { path: 'perfil', loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule) },
  { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule) },
  { path: 'historial', loadChildren: () => import('./pages/historial/historial.module').then(m => m.HistorialPageModule) },
  { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule) },
  { path: 'map', loadChildren: () => import('./pages/map/map.module').then(m => m.MapPageModule) },
  { path: 'crear-viaje', loadChildren: () => import('./pages/crear-viaje/crear-viaje.module').then(m => m.CrearViajePageModule) }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
