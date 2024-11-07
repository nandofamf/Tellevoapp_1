import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OfertasService {
  private ofertas: any[] = []; // Aquí se almacenan todas las ofertas
  private solicitudes: any[] = []; // Aquí se almacenan las solicitudes

  constructor() {}

  // Método para agregar una oferta
  agregarOferta(oferta: any) {
    oferta.asientosOcupados = 0; // Inicializamos los asientos ocupados en 0
    this.ofertas.push(oferta);
  }

  // Método para obtener todas las ofertas
  obtenerOfertas() {
    return this.ofertas;
  }

  // Método para tomar una oferta (Pasajero)
  tomarOferta(ofertaTomada: any, pasajero: string) {
    // Agregar la solicitud a la lista de solicitudes
    this.solicitudes.push({ oferta: ofertaTomada, pasajero });

    // Incrementar los asientos ocupados
    ofertaTomada.asientosOcupados++;

    // Actualizar la lista de ofertas (opcional si quieres reflejarlo en la oferta original)
    this.ofertas = this.ofertas.map(oferta => 
      oferta === ofertaTomada ? { ...oferta, asientosOcupados: ofertaTomada.asientosOcupados } : oferta
    );
  }

  // Método para obtener todas las solicitudes que los pasajeros han hecho
  obtenerSolicitudes() {
    return this.solicitudes;
  }
}
