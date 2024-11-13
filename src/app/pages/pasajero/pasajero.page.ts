import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit, OnDestroy {
  viajesDisponibles: any[] = [];
  usuarioId: string = '';
  usuarioCorreo: string = '';
  nombrePasajero: string = 'Nombre del Pasajero'; // Reemplaza por la lógica que obtenga el nombre del usuario real
  private userEmailSubscription: Subscription | undefined;
  private viajesSubscription: Subscription | undefined;

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.userEmailSubscription = this.authService.getUserEmail().subscribe(email => {
      if (email) {
        this.usuarioId = email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        this.usuarioCorreo = email; // Guardamos el correo para mostrarlo luego
        console.log("Usuario ID:", this.usuarioId);
        this.cargarViajesDisponibles();
      } else {
        console.error("Usuario no autenticado o ID no encontrado");
      }
    });
  }

  ngOnDestroy() {
    if (this.userEmailSubscription) {
      this.userEmailSubscription.unsubscribe();
    }
    if (this.viajesSubscription) {
      this.viajesSubscription.unsubscribe();
    }
  }

  cargarViajesDisponibles() {
    this.viajesSubscription = this.db.list('viajes').snapshotChanges().subscribe((changes) => {
      this.viajesDisponibles = changes.map((c) => {
        const viaje = c.payload.val() as any;
        const pasajeros = viaje.pasajeros ? Object.keys(viaje.pasajeros).length : 0;
        return {
          id: c.payload.key,
          asientosOcupados: pasajeros,
          asientosDisponibles: viaje.asientosTotales - pasajeros,
          ...viaje
        };
      });
      console.log("Viajes disponibles:", this.viajesDisponibles);
    });
  }

  tomarViaje(viajeId: string) {
    if (!this.usuarioId) {
      console.error('Usuario no autenticado');
      return;
    }

    // Datos del pasajero que se almacenarán
    const pasajeroData = {
      nombre: this.nombrePasajero,
      correo: this.usuarioCorreo
    };

    // Guarda los datos del pasajero en el nodo 'pasajeros' dentro del viaje
    this.db.object(`viajes/${viajeId}/pasajeros/${this.usuarioId}`).set(pasajeroData)
      .then(() => {
        this.mostrarToast('Te has unido al viaje con éxito.', 'success');
        this.router.navigate(['/historial']);
      })
      .catch((error) => {
        console.error("Error al unirse al viaje:", error);
        this.mostrarToast('Error al unirse al viaje. Intente nuevamente.', 'danger');
      });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }
}
