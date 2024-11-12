// pasajero.page.ts
import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  viajes: any[] = [];
  pasajeroId: string = '';
  nombrePasajero: string = '';

  constructor(
    private db: AngularFireDatabase,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private notificacionService: NotificacionService
  ) {}

  async ngOnInit() {
    this.authService.getUserEmail().subscribe(email => {
      if (email) {
        this.pasajeroId = email.replace(/[^a-zA-Z0-9]/g, '');
        this.nombrePasajero = email.split('@')[0]; // Extrae el nombre antes del '@' como nombre del pasajero
      }
    });
    this.cargarViajes();
  }

  cargarViajes() {
    this.db.list('viajes').snapshotChanges().subscribe((changes) => {
      this.viajes = changes.map((c) => {
        const data: any = c.payload.val();
        return {
          id: c.payload.key,
          ...(typeof data === 'object' && data !== null ? data : {}),
          asientosInfo: this.getAsientosDisponibles(data?.asientosDisponibles, data?.pasajeros)
        };
      }).filter((viaje: any) => viaje.asientosInfo?.ocupados < viaje.asientosDisponibles);
    });
  }

  async tomarViaje(viajeId: string) {
    try {
      // Registrar al pasajero en el viaje
      await this.db.object(`viajes/${viajeId}/pasajeros/${this.pasajeroId}`).set(true);

      // Obtener el ID del conductor
      const conductorIdSnapshot = await this.db.object(`viajes/${viajeId}/conductorId`).query.once('value');
      const conductorId = conductorIdSnapshot.val();

      // Enviar notificación al conductor sobre el nuevo pasajero
      this.notificacionService.notificarViajeTomado(conductorId, this.nombrePasajero);

      // Mostrar mensaje de éxito al pasajero
      const toast = await this.toastController.create({
        message: 'Se ha tomado el viaje con éxito',
        duration: 3000,
        color: 'success',
      });
      toast.present();

      // Navegar al mapa con el viaje tomado
      this.router.navigate(['/map'], { queryParams: { viajeId } });
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

  async cancelarViaje(viajeId: string) {
    try {
      // Eliminar al pasajero del viaje
      await this.db.object(`viajes/${viajeId}/pasajeros/${this.pasajeroId}`).remove();

      // Obtener el ID del conductor
      const conductorIdSnapshot = await this.db.object(`viajes/${viajeId}/conductorId`).query.once('value');
      const conductorId = conductorIdSnapshot.val();

      // Enviar notificación al conductor sobre la cancelación del viaje
      this.notificacionService.notificarViajeCancelado(conductorId, this.nombrePasajero);

      // Mostrar mensaje de cancelación al pasajero
      const toast = await this.toastController.create({
        message: 'Has cancelado el viaje con éxito',
        duration: 3000,
        color: 'warning',
      });
      toast.present();
    } catch (error) {
      console.error("Error al cancelar el viaje:", error);
      const toast = await this.toastController.create({
        message: 'Error: no se pudo cancelar el viaje debido a un problema de red.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
    }
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
