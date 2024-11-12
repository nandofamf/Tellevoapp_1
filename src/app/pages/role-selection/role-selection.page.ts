// role-selection.page.ts

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-role-selection',
  templateUrl: './role-selection.page.html',
  styleUrls: ['./role-selection.page.scss'],
})
export class RoleSelectionPage implements OnInit {
  searchQuery: string = '';  
  filteredDestinations: any[] = [];  
  selectedDestination: any = null;  
  availableDrivers: any[] = [];  

  // Lista completa de destinos
  allDestinations: any[] = [
    { nombre: 'Aeropuerto Internacional', descripcion: 'Aeropuerto de la ciudad' },
    { nombre: 'Centro Comercial', descripcion: 'Zona de compras' },
    { nombre: 'Parque Central', descripcion: 'Lugar para recreación' },
    { nombre: 'Museo de Historia', descripcion: 'Museo de la ciudad' },
    { nombre: 'Estadio', descripcion: 'Lugar de eventos deportivos' }
  ];

  // Lista completa de conductores
  allDrivers: any[] = [
    { nombre: 'Juan Pérez', vehiculo: 'Toyota Corolla', tarifa: 20000, foto: 'assets/driver1.jpg', capacidadTotal: 4, asientosOcupados: 1 },
    { nombre: 'María Gómez', vehiculo: 'Honda Civic', tarifa: 25000, foto: 'assets/driver2.jpg', capacidadTotal: 4, asientosOcupados: 3 },
    { nombre: 'Carlos Sánchez', vehiculo: 'Ford Focus', tarifa: 22000, foto: 'assets/driver3.jpg', capacidadTotal: 4, asientosOcupados: 2 }
  ];

  constructor() {}

  ngOnInit() {}

   
  buscarDirecciones(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredDestinations = [];
      return;
    }
    this.filteredDestinations = this.allDestinations.filter(destino =>
      destino.nombre.toLowerCase().includes(query) || destino.descripcion.toLowerCase().includes(query)
    );
  }

   
  seleccionarDestino(destino: any) {
    this.selectedDestination = destino;
    this.filteredDestinations = [];
    this.obtenerConductoresDisponibles();
  }

   
  obtenerConductoresDisponibles() {
    this.availableDrivers = this.allDrivers.filter(driver => driver.capacidadTotal > driver.asientosOcupados);
  }
}
