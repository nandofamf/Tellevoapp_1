import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViajeDataService {
  private viajeData: any = null;

  setViajeData(data: any) {
    this.viajeData = data;
  }

  getViajeData() {
    return this.viajeData;
  }

  setDirecciones(direccionPartida: string, direccionDestino: string) {
    this.viajeData = {
      ...this.viajeData,
      direccionPartida: direccionPartida,
      direccionDestino: direccionDestino
    };
  }

  clearViajeData() {
    this.viajeData = null;
  }
}
