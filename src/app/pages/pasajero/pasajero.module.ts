import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PasajeroPageRoutingModule } from './pasajero-routing.module'; // Importación corregida
import { PasajeroPage } from './pasajero.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasajeroPageRoutingModule // Importación corregida
  ],
  declarations: [PasajeroPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añadido para reconocer los elementos de Ionic
})
export class PasajeroPageModule {}  // Nombre correcto del módulo
