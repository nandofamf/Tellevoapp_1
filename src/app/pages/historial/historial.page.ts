import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  selectedRole: string | null = null;
  viajesConductor: any[] = [];
  viajesPasajero: any[] = [];
  userId: string | null = null;

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const currentUser = await this.auth.currentUser;
    if (currentUser) {
      this.userId = currentUser.uid;
      this.cargarHistorial();
    }
  }

  verHistorial(role: string) {
    this.selectedRole = role;
    if (role === 'conductor') {
      this.cargarHistorialConductor();
    } else if (role === 'pasajero') {
      this.cargarHistorialPasajero();
    }
  }

  cargarHistorial() {
    this.cargarHistorialConductor();
    this.cargarHistorialPasajero();
  }

  cargarHistorialConductor() {
    this.firestore.collection('historial', ref => ref.where('conductorId', '==', this.userId))
      .valueChanges()
      .subscribe((viajes: any[]) => {
        this.viajesConductor = viajes.map(viaje => ({
          ...viaje,
          fecha: viaje.fecha.toDate(), // Convertir Timestamp a Date
          origen: viaje.direccionPartida || 'Origen desconocido', // Usar directamente como texto
          destino: viaje.direccionDestino || 'Destino desconocido', // Usar directamente como texto
          ganancias: viaje.costo
        }));
      });
  }
  
  cargarHistorialPasajero() {
    this.firestore.collection('historial', ref => ref.where('pasajeroId', '==', this.userId))
      .valueChanges()
      .subscribe((viajes: any[]) => {
        this.viajesPasajero = viajes.map(viaje => ({
          ...viaje,
          fecha: viaje.fecha.toDate(), // Convertir Timestamp a Date
          origen: viaje.direccionPartida || 'Origen desconocido', // Usar directamente como texto
          destino: viaje.direccionDestino || 'Destino desconocido', // Usar directamente como texto
          costo: viaje.costo
        }));
      });
  }
  
  
  async limpiarHistorialConductor() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas limpiar todo el historial de conductor?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Limpiar',
          handler: () => {
            this.firestore.collection('historial', ref => ref.where('conductorId', '==', this.userId))
              .get().subscribe(snapshot => {
                const batch = this.firestore.firestore.batch();
                snapshot.forEach(doc => {
                  batch.delete(doc.ref);
                });
                batch.commit().then(() => {
                  this.viajesConductor = [];
                });
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async limpiarHistorialPasajero() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas limpiar todo el historial de pasajero?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Limpiar',
          handler: () => {
            this.firestore.collection('historial', ref => ref.where('pasajeroId', '==', this.userId))
              .get().subscribe(snapshot => {
                const batch = this.firestore.firestore.batch();
                snapshot.forEach(doc => {
                  batch.delete(doc.ref);
                });
                batch.commit().then(() => {
                  this.viajesPasajero = [];
                });
              });
          }
        }
      ]
    });
    await alert.present();
  }
}
