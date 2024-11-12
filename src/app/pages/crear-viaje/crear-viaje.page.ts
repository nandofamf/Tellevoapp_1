import { Component, OnInit } from '@angular/core';
import { ViajeDataService } from '../../services/viaje-data.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GeocodingService } from '../../services/geocoding.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {
  direccionPartida: string = '';
  direccionDestino: string = '';
  fechaViaje: string = '';
  horaViaje: string = '';
  seats: number = 1;
  patente: string = '';
  precioAsiento: number = 0;
  comentarios: string = '';
  conductorId: string | null = null;

  constructor(
    private viajeDataService: ViajeDataService,
    private db: AngularFireDatabase,
    private router: Router,
    private toastController: ToastController,
    private geocodingService: GeocodingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener el correo del usuario autenticado y formatearlo sin caracteres especiales
    this.authService.getUserEmail().subscribe(email => {
      if (email) {
        this.conductorId = email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();  // Formato consistente
        console.log("Conductor ID:", this.conductorId);
      } else {
        console.error("Conductor no autenticado");
      }
    });

    const viajeData = this.viajeDataService.getViajeData();
    if (viajeData) {
      this.direccionPartida = viajeData.direccionPartida;
      this.direccionDestino = viajeData.direccionDestino;
    }
  }

  incrementSeats() {
    this.seats++;
  }

  decrementSeats() {
    if (this.seats > 1) {
      this.seats--;
    }
  }

  guardarViajeEnFirebase() {
    if (!this.conductorId) {
      console.error('Conductor no autenticado');
      return;
    }

    this.geocodingService.getCoordinates(this.direccionPartida).subscribe(coordsPartida => {
      if (coordsPartida) {
        this.geocodingService.getCoordinates(this.direccionDestino).subscribe(coordsDestino => {
          if (coordsDestino) {
            const viajeData = {
              direccionPartida: this.direccionPartida,
              direccionDestino: this.direccionDestino,
              fechaViaje: this.fechaViaje || new Date().toLocaleDateString(),
              horaViaje: this.horaViaje || new Date().toLocaleTimeString(),
              asientosDisponibles: this.seats,
              patente: this.patente || 'Sin patente',
              precioAsiento: this.precioAsiento || 0,
              comentarios: this.comentarios,
              latPartida: coordsPartida[1],
              lngPartida: coordsPartida[0],
              latDestino: coordsDestino[1],
              lngDestino: coordsDestino[0],
              idconductor: this.conductorId  // Utilizamos el formato consistente de idconductor
            };

            this.db.list('viajes').push(viajeData)
              .then(() => {
                this.mostrarToast('Se ha creado con éxito el viaje', 'success');
                this.router.navigate(['/historial']);
              })
              .catch(error => {
                console.error('Error al guardar en Firebase', error);
                this.mostrarToast('Error al guardar el viaje. Intente nuevamente.', 'danger');
              });
          } else {
            this.mostrarToast('No se pudieron obtener las coordenadas del destino.', 'danger');
          }
        });
      } else {
        this.mostrarToast('No se pudieron obtener las coordenadas de partida.', 'danger');
      }
    });
  }

  guardarViaje() {
    this.viajeDataService.setViajeData({
      direccionPartida: this.direccionPartida,
      direccionDestino: this.direccionDestino,
      fechaViaje: this.fechaViaje,
      horaViaje: this.horaViaje,
      asientosDisponibles: this.seats,
      patente: this.patente,
      precioAsiento: this.precioAsiento,
      comentarios: this.comentarios,
    });

    this.guardarViajeEnFirebase();
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
