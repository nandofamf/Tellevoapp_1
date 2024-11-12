// notificacion.service.ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  constructor(private db: AngularFireDatabase) {}

  enviarNotificacionAlConductor(conductorId: string, mensaje: string) {
    const notificacionRef = this.db.list(`notificaciones/${conductorId}`);
    notificacionRef.push({
      mensaje,
      timestamp: Date.now()
    });
  }

  notificarViajeTomado(conductorId: string, nombrePasajero: string) {
    this.enviarNotificacionAlConductor(conductorId, `${nombrePasajero} ha tomado el viaje con éxito.`);
  }

  notificarViajeCancelado(conductorId: string, nombrePasajero: string) {
    this.enviarNotificacionAlConductor(conductorId, `${nombrePasajero} ha cancelado el viaje.`);
  }
}
