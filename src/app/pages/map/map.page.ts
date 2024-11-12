import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import * as mapboxgl from 'mapbox-gl';
import { GeocodingService } from '../../services/geocoding.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  map!: mapboxgl.Map;
  viajeId: string = '';
  direccionPartida: string = '';
  direccionDestino: string = '';
  precioAsiento: number = 0;
  pasajeroId: string = 'pasajero123'; 
  patente: string = '';// Obtén este ID dinámicamente

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private geocodingService: GeocodingService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.viajeId = params['viajeId'] || '';
      if (this.viajeId) {
        this.cargarViaje(); // Llamada a cargarViaje en ngOnInit
      }
    });
  }

  async cargarViaje() {
    this.db.object(`viajes/${this.viajeId}`).valueChanges().subscribe(async (viaje: any) => {
      if (viaje && viaje.direccionPartida && viaje.direccionDestino) {
        this.direccionPartida = viaje.direccionPartida;
        this.direccionDestino = viaje.direccionDestino;
        this.precioAsiento = viaje.precioAsiento || 0;
        this.patente = viaje.patente || 'No disponible';

        try {
          const coordsPartida = await this.geocodingService.getCoordinates(this.direccionPartida).toPromise();
          const coordsDestino = await this.geocodingService.getCoordinates(this.direccionDestino).toPromise();

          if (coordsPartida && coordsDestino) {
            const route = await this.geocodingService.getRoute(coordsPartida, coordsDestino);
            if (route) {
              this.cargarMapa(coordsPartida, coordsDestino, route);
            } else {
              console.error('No se pudo obtener la ruta. Verifique las direcciones.');
            }
          }
        } catch (error) {
          console.error('Error al obtener las coordenadas o la ruta:', error);
        }
      } else {
        console.error('Datos del viaje incompletos. No se puede cargar el mapa.');
      }
    });
  }

  cargarMapa(start: [number, number], end: [number, number], route: [number, number][]) {
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoibmFuZG9mYW1mIiwiYSI6ImNtM2JzamNjNDB4cGYyanBzYzZudTlyMmwifQ.wLGsjrc2Nsp0jk7G3blyjA';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: start,
      zoom: 12
    });

    this.map.on('load', () => {
      this.map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route
          },
          properties: {}
        }
      });

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#1db7dd',
          'line-width': 6
        }
      });

      // Marcadores de inicio y destino
      new mapboxgl.Marker({ color: 'green' }).setLngLat(start).addTo(this.map);
      new mapboxgl.Marker({ color: 'red' }).setLngLat(end).addTo(this.map);
    });
  }

  async cancelarViaje() {
    try {
      await this.db.object(`viajes/${this.viajeId}/pasajeros/${this.pasajeroId}`).remove();

      const viajeRef = this.db.object(`viajes/${this.viajeId}`).valueChanges();
      viajeRef.subscribe(async (viaje: any) => {
        const totalAsientos = viaje.asientosDisponibles || 4;
        const ocupados = Object.keys(viaje.pasajeros || {}).length;
        const disponibles = totalAsientos - ocupados;

        await this.db.object(`viajes/${this.viajeId}`).update({ asientosOcupados: ocupados, asientosDisponibles: disponibles });
      });

      const toast = await this.toastController.create({
        message: 'Has cancelado el viaje con éxito',
        duration: 3000,
        color: 'success',
      });
      toast.present();

      this.router.navigate(['/pasajero']);
    } catch (error) {
      console.error("Error al cancelar el viaje:", error);
      const toast = await this.toastController.create({
        message: 'Error: no se pudo cancelar el viaje.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
    }
  }
}
