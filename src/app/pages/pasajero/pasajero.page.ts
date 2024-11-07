import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importar AngularFireAuth
import { AlertController } from '@ionic/angular';
import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  viajes$: Observable<any[]> = of([]); // Inicialización con observable vacío

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth, // Inyectar AngularFireAuth
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.obtenerViajes();
  }

  obtenerViajes() {
    this.viajes$ = this.firestore.collection('viajes').valueChanges({ idField: 'id' });
  }

  async tomarOferta(viaje: any) {
    console.log('Intentando tomar el viaje:', viaje);

    const currentUser = await this.auth.currentUser; // Obtener usuario autenticado
    if (!currentUser) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo autenticar al usuario.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (viaje.asientosOcupados < viaje.capacidad) {
      try {
        // Incrementar asientos ocupados
        console.log('Incrementando asientos ocupados...');
        await this.firestore.collection('viajes').doc(viaje.id).update({
          asientosOcupados: viaje.asientosOcupados + 1
        });
        console.log('Asientos ocupados incrementados.');

        // Registrar en el historial
        console.log('Registrando en el historial...');
        await this.firestore.collection('historial').add({
          pasajeroId: currentUser.uid, // UID del pasajero autenticado
          viajeId: viaje.id,
          conductorId: viaje.conductorId,
          direccionPartida: viaje.direccionPartida.place_name,
          direccionDestino: viaje.direccionDestino.place_name,
          costo: viaje.costo,
          fecha: new Date().toISOString(),
          estado: viaje.estado || 'pendiente'
        });
        console.log('Registro en historial completado.');

        // Verificar y eliminar el viaje si ya no hay cupos disponibles
        if (viaje.asientosOcupados + 1 >= viaje.capacidad) {
          console.log('Eliminando viaje con cupo lleno...');
          await this.firestore.collection('viajes').doc(viaje.id).delete();
          console.log('Viaje eliminado.');
        }

        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Has tomado el viaje con éxito.',
          buttons: ['OK']
        });
        await alert.present();
      } catch (error: unknown) {
        console.error('Error al tomar el viaje:', error);

        const errorMessage = (error as Error).message || 'Error desconocido';
        
        const alert = await this.alertController.create({
          header: 'Error',
          message: `Hubo un error al tomar el viaje: ${errorMessage}`,
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Sin cupo',
        message: 'Este viaje ya no tiene cupos disponibles.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async actualizarViajes() {
    try {
      const viajesSnapshot = await this.firestore.collection('viajes').get().toPromise();
      if (!viajesSnapshot) {
        console.log('No hay viajes disponibles para actualizar.');
        return;
      }

      const batch = this.firestore.firestore.batch();

      viajesSnapshot.docs.forEach((doc) => {
        const viaje = doc.data() as any; // Asegurando el tipo de viaje
        if (viaje.asientosOcupados >= viaje.capacidad) {
          console.log(`Eliminando viaje con ID: ${doc.id} por cupo lleno.`);
          batch.delete(doc.ref);
        }
      });

      await batch.commit();
      console.log('Viajes con cupo lleno eliminados.');

      const alert = await this.alertController.create({
        header: 'Actualizado',
        message: 'Los viajes con cupo lleno han sido eliminados.',
        buttons: ['OK']
      });
      await alert.present();

      this.obtenerViajes(); // Refrescar la lista de viajes
    } catch (error) {
      console.error('Error al actualizar los viajes:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un error al actualizar los viajes. Por favor, intenta de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
