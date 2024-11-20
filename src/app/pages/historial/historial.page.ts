import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

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
  notificaciones: string[] = [];
  mostrarPasajeros: boolean = false;
  esConductor: boolean = true;
  private userEmailSubscription: Subscription | undefined;
  private viajesSubscription: Subscription | undefined;

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private router: Router,
    private storage: Storage
  ) {}

  async ngOnInit() {
    // Inicializar Ionic Storage
    await this.storage.create();

    // Obtener el ID del usuario autenticado
    this.authService.getUserEmail().subscribe((email) => {
      if (email) {
        this.usuarioId = email.replace(/[^a-zA-Z0-9]/g, ''); // Normalizar ID del usuario
        this.refrescarDatos();
      } else {
        console.error('Usuario no autenticado o ID no encontrado');
      }
    });
  }

  ngOnDestroy() {
    // Desuscribirse de las suscripciones activas
    this.userEmailSubscription?.unsubscribe();
    this.viajesSubscription?.unsubscribe();
  }

  refrescarDatos() {
    console.log('Refrescando datos...');
    if (navigator.onLine) {
      // Si hay conexión, cargar datos desde Firebase
      this.cargarViajes();
    } else {
      // Si no hay conexión, cargar datos locales
      console.log('Sin conexión a Internet. Cargando datos locales...');
      this.cargarDatosLocales();
    }
  }

  cargarViajes() {
    // Desuscribirse de suscripciones previas para evitar duplicados
    this.viajesSubscription?.unsubscribe();

    // Cargar según el tipo de usuario
    this.esConductor ? this.cargarViajesConductor() : this.cargarViajesPasajero();
  }

  async cargarViajesConductor() {
    try {
      if (navigator.onLine) {
        this.viajesSubscription = this.db
          .list('viajes', (ref) => ref.orderByChild('idconductor').equalTo(this.usuarioId))
          .snapshotChanges()
          .subscribe(
            async (changes) => {
              this.viajesConductor = changes.map((c) => {
                const viaje = {
                  id: c.payload.key, // ID del viaje
                  ...(c.payload.val() as any), // Datos del viaje
                };
                // Calcular la cantidad de asientos ocupados
                viaje.asientosOcupados = viaje.pasajeros ? Object.keys(viaje.pasajeros).length : 0;
                return viaje;
              });

              console.log('Viajes del conductor:', this.viajesConductor);

              // Guardar en el almacenamiento local
              await this.storage.set('viajesConductor', this.viajesConductor);
            },
            (error) => {
              console.error('Error al cargar los viajes del conductor:', error);
            }
          );
      } else {
        // Si no hay conexión, cargar datos locales
        this.viajesConductor = (await this.storage.get('viajesConductor')) || [];
        console.log('Viajes del conductor cargados localmente:', this.viajesConductor);
      }
    } catch (error) {
      console.error('Error al cargar los viajes del conductor:', error);
    }
  }

  async cargarViajesPasajero() {
    try {
      if (navigator.onLine) {
        this.viajesSubscription = this.db
          .list('viajes')
          .snapshotChanges()
          .subscribe(
            async (changes) => {
              this.viajesPasajero = changes
                .map((c) => ({
                  id: c.payload.key,
                  ...(c.payload.val() as any),
                }))
                .filter((viaje) => viaje.pasajeros && viaje.pasajeros[this.usuarioId]); // Verifica si el usuario es pasajero

              console.log('Viajes del pasajero:', this.viajesPasajero);

              // Guardar localmente los viajes del pasajero
              await this.storage.set('viajesPasajero', this.viajesPasajero);
            },
            (error) => {
              console.error('Error al cargar los viajes del pasajero:', error);
            }
          );
      } else {
        // Si no hay conexión, cargar datos locales
        this.viajesPasajero = (await this.storage.get('viajesPasajero')) || [];
        console.log('Viajes del pasajero cargados localmente:', this.viajesPasajero);
      }
    } catch (error) {
      console.error('Error al cargar los viajes del pasajero:', error);
    }
  }

  async cargarDatosLocales() {
    try {
      if (this.esConductor) {
        this.viajesConductor = (await this.storage.get('viajesConductor')) || [];
        console.log('Viajes del conductor cargados localmente:', this.viajesConductor);
      } else {
        this.viajesPasajero = (await this.storage.get('viajesPasajero')) || [];
        console.log('Viajes del pasajero cargados localmente:', this.viajesPasajero);
      }
    } catch (error) {
      console.error('Error al cargar datos locales:', error);
    }
  }

  mostrarConductor() {
    this.esConductor = true;
    this.refrescarDatos();
  }

  mostrarPasajero() {
    this.esConductor = false;
    this.refrescarDatos();
  }

  verPasajeros(viajeId: string) {
    this.db
      .list(`viajes/${viajeId}/pasajeros`)
      .valueChanges()
      .subscribe(
        (pasajeros: any[]) => {
          this.pasajeros = pasajeros || [];
          this.mostrarPasajeros = true;
        },
        (error) => {
          console.error('Error al obtener pasajeros:', error);
        }
      );
  }

  ocultarPasajeros() {
    this.mostrarPasajeros = false;
    this.pasajeros = [];
  }

  verMapa(viajeId: string) {
    this.router.navigate(['/map'], { queryParams: { viajeId } });
  }

  cancelarViaje(viajeId: string) {
    this.db
      .object(`viajes/${viajeId}/pasajeros/${this.usuarioId}`)
      .remove()
      .then(() => {
        this.notificaciones.push('Has cancelado el viaje con éxito.');
      })
      .catch((error) => {
        console.error('Error al cancelar el viaje:', error);
        this.notificaciones.push('Error al cancelar el viaje.');
      });
  }
}
