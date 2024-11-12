// historial.page.ts
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
  notificaciones: any[] = [];
  usuarioId: string = '';
  esConductor: boolean = true;
  private viajesSubscription: Subscription | undefined;

  constructor(private db: AngularFireDatabase, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUserEmail().subscribe((email) => {
      if (email) {
        this.usuarioId = email.replace(/[^a-zA-Z0-9]/g, '');
        this.cargarViajes();
      }
    });
  }

  ngOnDestroy() {
    if (this.viajesSubscription) {
      this.viajesSubscription.unsubscribe();
    }
  }

  cargarViajes() {
    if (this.esConductor) {
      this.cargarViajesConductor();
    }
  }

  cargarViajesConductor() {
    this.viajesSubscription = this.db.list('viajes', ref => ref.orderByChild('conductorId').equalTo(this.usuarioId))
      .snapshotChanges().subscribe((changes) => {
        this.viajesConductor = changes.map((c) => ({
          id: c.payload.key,
          ...(c.payload.val() as any),
        }));
      });
  }

  verPasajeros(viajeId: string) {
    this.db.list(`notificaciones/${this.usuarioId}`).valueChanges().subscribe((notificaciones) => {
      this.notificaciones = notificaciones;
    });
  }

  verMapa(viajeId: string) {
    this.router.navigate(['/map'], { queryParams: { viajeId } });
  }
}
