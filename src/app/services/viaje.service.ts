import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViajeService {
  constructor(private firestore: AngularFirestore) {}

  obtenerHistorialConductor(): Observable<any[]> {
    return this.firestore.collection('viajesConductor').valueChanges();
  }

  obtenerHistorialPasajero(): Observable<any[]> {
    return this.firestore.collection('viajesPasajero').valueChanges();
  }

  crearViaje(viaje: any): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('viajes').doc(id).set(viaje);
  }

  obtenerViajes(): Observable<any[]> {
    return this.firestore.collection('viajes').valueChanges();
  }

  actualizarViaje(id: string, data: any): Promise<void> {
    return this.firestore.collection('viajes').doc(id).update(data);
  }

  obtenerPasajeros(): Observable<any[]> {
    return this.firestore.collection('pasajeros').valueChanges();
  }

  obtenerPasajerosEnTiempoReal(conductorId: string): Observable<any[]> {
    return this.firestore.collection('historial', ref => 
      ref.where('conductorId', '==', conductorId).where('estado', '==', 'pendiente')
    ).valueChanges({ idField: 'id' });
  }

  actualizarSolicitudPasajero(id: string, data: any): Promise<void> {
    return this.firestore.collection('historial').doc(id).update(data);
  }

  // Nuevo método para obtener el viaje del conductor actual
  obtenerViajeConductor(conductorId: string): Observable<any> {
    return this.firestore.collection('viajes', ref => 
      ref.where('conductorId', '==', conductorId).limit(1)
    ).valueChanges({ idField: 'id' });
  }
}
