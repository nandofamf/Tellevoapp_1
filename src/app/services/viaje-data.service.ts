import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root',
})
export class ViajeDataService {
  private viajeData: any = {
    direccionPartida: '',
    direccionDestino: ''
  };

  constructor(private db: AngularFireDatabase) {
    // Habilitar persistencia offline
    this.db.database.goOnline();
  }

  setDirecciones(partida: string, destino: string) {
    this.viajeData.direccionPartida = partida;
    this.viajeData.direccionDestino = destino;
  }

  setViajeData(data: any) {
    this.viajeData = { ...this.viajeData, ...data };  // Fusiona la nueva data con la ya existente
  }

  getViajeData() {
    return this.viajeData;
  }

  clearData() {
    this.viajeData = {
      direccionPartida: '',
      direccionDestino: ''
    };
  }
}
