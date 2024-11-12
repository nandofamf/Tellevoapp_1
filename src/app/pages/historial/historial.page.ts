import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit, OnDestroy {
  viajesConductor: any[] = [];
  viajesPasajero: any[] = [];
  usuarioId: string = '';
  pasajeros: any[] = [];
  mostrarPasajeros: boolean = false;
  esConductor: boolean = true;
  private userEmailSubscription: Subscription | undefined;
  private viajesSubscription: Subscription | undefined;

  constructor(private db: AngularFireDatabase, private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    this.authService.getUserEmail().subscribe(email => {
      if (email) {
        this.usuarioId = email.replace(/[^a-zA-Z0-9]/g, '');
        this.cargarViajes();
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

  cargarViajes() {
    if (this.esConductor) {
      this.cargarViajesConductor();
    } else {
      this.cargarViajesPasajero();
    }
  }

  cargarViajesConductor() {
    this.viajesSubscription = this.db.list('viajes', ref => ref.orderByChild('conductorId').equalTo(this.usuarioId)).snapshotChanges().subscribe((changes) => {
      this.viajesConductor = changes.map((c) => ({
        id: c.payload.key,
        ...(c.payload.val() as any),
      }));
    });
  }

  cargarViajesPasajero() {
    this.viajesSubscription = this.db.list('viajes').snapshotChanges().subscribe((changes) => {
      this.viajesPasajero = changes
        .map((c) => ({
          id: c.payload.key,
          ...(c.payload.val() as any),
        }))
        .filter((viaje) => viaje.pasajeros && viaje.pasajeros[this.usuarioId]);
    });
  }

  mostrarConductor() {
    this.esConductor = true;
    this.cargarViajes();
  }

  mostrarPasajero() {
    this.esConductor = false;
    this.cargarViajes();
  }

  verPasajeros(viajeId: string) {
    this.db.list(`viajes/${viajeId}/pasajeros`).valueChanges().subscribe((pasajeros) => {
      this.pasajeros = pasajeros;
      this.mostrarPasajeros = true;
    });
  }

  ocultarPasajeros() {
    this.mostrarPasajeros = false;
    this.pasajeros = [];
  }

  verMapa(viajeId: string) {
    this.router.navigate(['/map'], { queryParams: { viajeId } });
  }
}
