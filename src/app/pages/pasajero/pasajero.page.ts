import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  viajes: any[] = [];
  pasajeroId: string = '';

  constructor(
    private db: AngularFireDatabase,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.authService.getUserEmail().subscribe(email => {
      if (email) {
        this.pasajeroId = email.replace(/[^a-zA-Z0-9]/g, '');
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

  async tomarViaje(viajeId: string, pasajeroId: string) {
    try {
      await this.db.object(`viajes/${viajeId}/pasajeros/${pasajeroId}`).set(true);

      const toast = await this.toastController.create({
        message: 'Se ha tomado el viaje con éxito',
        duration: 3000,
        color: 'success',
      });
      toast.present();

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
