import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

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
  precioAsiento: number | null = null;
  patente: string = '';
  partidaCoords: [number, number] | null = null;
  destinoCoords: [number, number] | null = null;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.viajeId = params['viajeId'];
      if (this.viajeId) {
        this.cargarDatosDelViaje(this.viajeId);
      }
    });
    this.initializeMap();
  }

  initializeMap() {
    navigator.geolocation.getCurrentPosition((position) => {
      const userCoords: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];

      mapboxgl.accessToken = environment.mapbox.accessToken;

      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: userCoords,
        zoom: 13,
      });

      this.map.on('load', () => {
        if (this.partidaCoords && this.destinoCoords) {
          this.mostrarRuta(this.partidaCoords, this.destinoCoords);
        }
      });
    });
  }

  cargarDatosDelViaje(viajeId: string) {
    this.db.object(`viajes/${viajeId}`).valueChanges().subscribe((viaje: any) => {
      if (viaje) {
        this.direccionPartida = viaje.direccionPartida || 'No disponible';
        this.direccionDestino = viaje.direccionDestino || 'No disponible';
        this.precioAsiento = viaje.precioAsiento || null;  // Ajuste del nombre del campo
        this.patente = viaje.patente || 'No disponible';
        this.partidaCoords = [viaje.lngPartida, viaje.latPartida];
        this.destinoCoords = [viaje.lngDestino, viaje.latDestino];

        if (this.map && this.map.loaded()) {
          this.mostrarRuta(this.partidaCoords, this.destinoCoords);
        }
      }
    });
  }

  mostrarRuta(partida: [number, number], destino: [number, number]) {
    if (!this.map) {
      console.error('Map is not initialized.');
      return;
    }

    // Añadir marcadores de partida y destino
    new mapboxgl.Marker().setLngLat(partida).addTo(this.map);
    new mapboxgl.Marker().setLngLat(destino).addTo(this.map);

    // Solicitar la ruta a la API de direcciones de Mapbox
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${partida[0]},${partida[1]};${destino[0]},${destino[1]}?geometries=geojson&access_token=${environment.mapbox.accessToken}`;

    this.http.get(url).subscribe((response: any) => {
      if (response && response.routes && response.routes.length > 0) {
        const route = response.routes[0].geometry.coordinates;

        // Añadir la ruta al mapa
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#1E90FF',
            'line-width': 4,
          },
        });
      }
    });
  }

  async cancelarViaje() {
    const toast = await this.toastController.create({
      message: 'Viaje cancelado.',
      duration: 2000,
      color: 'danger',
    });
    toast.present();

    this.router.navigate(['/historial']);
  }
}
