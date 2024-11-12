import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViajeService {
  constructor(private db: AngularFireDatabase) {}

  crearViaje(viaje: any): Promise<void> {
    const id = this.db.createPushId();
    return this.db.list('viajes').set(id, { ...viaje, id });
  }

  obtenerViajePorId(viajeId: string): Observable<any> {
    return this.db.object(`viajes/${viajeId}`).valueChanges();
  }

  tomarViaje(viajeId: string, pasajeroId: string): Promise<void> {
    return this.db
      .object(`viajes/${viajeId}/pasajeros`)
      .update({ [pasajeroId]: true });
  }

  obtenerViajes(): Observable<any[]> {
    return this.db.list('viajes').valueChanges();
  }
}
