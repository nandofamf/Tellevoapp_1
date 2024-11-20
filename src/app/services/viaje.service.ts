import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class ViajeService {
  constructor(private db: AngularFireDatabase, private storage: Storage) {
    this.initStorage();
  }

  // Inicializar Ionic Storage
  private async initStorage() {
    await this.storage.create();
  }

  // Crear un nuevo viaje
  crearViaje(viaje: any): Promise<void> {
    const id = this.db.createPushId();
    return this.db.list('viajes').set(id, { ...viaje, id });
  }

  // Obtener un viaje por su ID
  obtenerViajePorId(viajeId: string): Observable<any> {
    return this.db.object(`viajes/${viajeId}`).valueChanges();
  }

  // Asignar un pasajero a un viaje
  tomarViaje(viajeId: string, pasajeroId: string): Promise<void> {
    return this.db
      .object(`viajes/${viajeId}/pasajeros`)
      .update({ [pasajeroId]: true });
  }

  // Obtener todos los viajes desde Firebase y sincronizarlos con Ionic Storage
  obtenerViajes(): Observable<any[]> {
    return this.db.list('viajes').valueChanges().pipe(
      tap(async (viajes: any[]) => {
        // Guardar los viajes en Ionic Storage
        await this.storage.set('viajes', viajes);
      }),
      catchError(async () => {
        console.error('Error obteniendo viajes desde Firebase. Cargando datos locales...');
        const viajesOffline = (await this.storage.get('viajes')) || [];
        return viajesOffline; // Asegúrate de que sea siempre un arreglo
      }),
      tap((viajesOffline: any[]) => {
        return of(viajesOffline); // Devuelve siempre un Observable<any[]>
      })
    );
  }

  // Obtener viajes sin conexión desde Ionic Storage
  async obtenerViajesOffline(): Promise<any[]> {
    return (await this.storage.get('viajes')) || [];
  }
}
