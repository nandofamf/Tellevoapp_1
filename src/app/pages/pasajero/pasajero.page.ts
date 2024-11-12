import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  viajes: any[] = [];
  pasajeroId: string = 'currentPasajeroId'; // Ajusta esto con la lógica para obtener el ID real del pasajero

  constructor(
    private db: AngularFireDatabase,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarViajes();
  }

  cargarViajes() {
    this.db.list('viajes').snapshotChanges().subscribe((changes) => {
      this.viajes = changes
        .map((c) => {
          const data: any = c.payload.val();
          return {
            id: c.payload.key,
            ...(typeof data === 'object' && data !== null ? data : {}),
            asientosInfo: this.getAsientosDisponibles(data?.asientosDisponibles, data?.pasajeros)
          };
        })
        .filter((viaje: any) => {
          return viaje.asientosInfo?.ocupados < viaje.asientosDisponibles; // Solo muestra viajes con asientos disponibles
        });
    });
  }

  // pasajero.page.ts
  async tomarViaje(viaje: any) {
    try {
      const pasajeroId = 'pasajero123'; // Obtén el ID dinámico del pasajero si es necesario
      console.log("Intentando tomar el viaje con ID:", viaje.id, "y pasajeroId:", pasajeroId);
  
      if (!viaje.id) {
        throw new Error("ID de viaje no válido");
      }
  
      // Guarda al pasajero en el viaje en Firebase
      await this.db.object(`viajes/${viaje.id}/pasajeros/${pasajeroId}`).set(true);
      console.log("Viaje tomado exitosamente");
  
      // Redirige a la página del mapa con el ID del viaje
      this.router.navigate(['/map'], { queryParams: { viajeId: viaje.id } });
    } catch (error) {
      console.error("Error al tomar el viaje:", error);
      const toast = await this.toastController.create({
        message: 'Error: no se pudo tomar el viaje debido a un problema de red.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
    }
  }
  

getCurrentPasajeroId() {
    // Implementar una forma de obtener el ID del pasajero dinámicamente desde Firebase o el estado de la aplicación
    return 'pasajero123'; // Ejemplo
}



  getAsientosDisponibles(totalAsientos: number, pasajeros: any): { ocupados: number; disponibles: any[]; ocupadosArray: any[] } {
    if (!pasajeros || typeof pasajeros !== 'object') {
      pasajeros = {};
    }

    const asientosOcupados = Object.keys(pasajeros).length;
    const asientosDisponibles = totalAsientos - asientosOcupados;

    return {
      ocupados: asientosOcupados,
      disponibles: asientosDisponibles > 0 ? new Array(asientosDisponibles) : [],
      ocupadosArray: asientosOcupados > 0 ? new Array(asientosOcupados) : []
    };
  }
}
