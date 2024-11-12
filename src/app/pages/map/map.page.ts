import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import * as mapboxgl from 'mapbox-gl';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  map!: mapboxgl.Map;
  viajeId: string = '';  // Inicialización para evitar error de propiedad no asignada
  direccionPartida: string = '';
  direccionDestino: string = '';
  precioAsiento: number = 0;  // Propiedad añadida para evitar error en la plantilla

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private geocodingService: GeocodingService
  ) {}

  ngOnInit() {
    this.viajeId = this.route.snapshot.paramMap.get('id') || '';  // Manejo de null
    if (this.viajeId) {
      this.cargarViaje();
    }
  }

  async cargarViaje() {
    this.db.object(`viajes/${this.viajeId}`).valueChanges().subscribe(async (viaje: any) => {
      if (viaje && viaje.direccionPartida && viaje.direccionDestino) {
        this.direccionPartida = viaje.direccionPartida;
        this.direccionDestino = viaje.direccionDestino;
        this.precioAsiento = viaje.precioAsiento || 0;

        try {
          const coordsPartida = await this.geocodingService.getCoordinates(this.direccionPartida).toPromise();
          const coordsDestino = await this.geocodingService.getCoordinates(this.direccionDestino).toPromise();

          if (coordsPartida && coordsDestino) {
            this.cargarMapa(coordsPartida, coordsDestino);
          } else {
            console.error('No se pudieron obtener las coordenadas correctas. Revisar las direcciones.');
          }
        } catch (error) {
          console.error('Error al obtener las coordenadas:', error);
        }
      } else {
        console.error('Datos del viaje incompletos. No se puede cargar el mapa.');
      }
    });
  }

  cargarMapa(start: [number, number], end: [number, number]) {
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
            coordinates: [start, end]
          },
          properties: {}  // Añadido para cumplir con el tipo requerido por GeoJSON
        } as GeoJSON.Feature
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
}
