import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasajeroPage } from './pasajero.page';

const routes: Routes = [
  {
    path: '',
    component: PasajeroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasajeroPageRoutingModule {}  // Nombre correcto del módulo de enrutamiento
