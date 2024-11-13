import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViajeDataService {
  private viajeData: any = {
    direccionPartida: '',
    direccionDestino: ''
  };

  constructor() {}

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
