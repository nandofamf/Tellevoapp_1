import { Component, OnInit } from '@angular/core';
import mapboxgl, { MapboxOptions } from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { MapsService } from 'src/app/services/maps.service';
import { Router } from '@angular/router';
import { ViajeDataService } from '../../services/viaje-data.service';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.page.html',
  styleUrls: ['./conductor.page.scss'],
})
export class ConductorPage implements OnInit {
  map!: mapboxgl.Map;
  partidaCoords: [number, number] | null = null;
  destinoCoords: [number, number] | null = null;
  direccionPartida: string = '';
  direccionDestino: string = '';
  sugerenciasPartida: string[] = [];
  sugerenciasDestino: string[] = [];

  constructor(
    private mapsService: MapsService,
    private router: Router,
    private viajeDataService: ViajeDataService
  ) {}

  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        mapboxgl.accessToken = environment.mapbox.accessToken;

        this.map = new mapboxgl.Map({
          container: 'map', // ID del contenedor en el HTML
          style: 'mapbox://styles/mapbox/streets-v11',
          center: userCoords,
          zoom: 13,
        });

        this.map.on('load', () => {
          this.map.resize();
          this.agregarMarcador(userCoords); // Marcador en la ubicación actual
        });
      },
      (error) => {
        console.error('Error obteniendo la ubicación:', error);
      }
    );
  }

  agregarMarcador(coordenadas: [number, number]) {
    new mapboxgl.Marker().setLngLat(coordenadas).addTo(this.map);
  }

  obtenerSugerenciasPartida() {
    this.mapsService.obtenerSugerencias(this.direccionPartida).subscribe((sugerencias: any) => {
      this.sugerenciasPartida = sugerencias.features.map((feature: any) => feature.place_name);
    });
  }

  obtenerSugerenciasDestino() {
    this.mapsService.obtenerSugerencias(this.direccionDestino).subscribe((sugerencias: any) => {
      this.sugerenciasDestino = sugerencias.features.map((feature: any) => feature.place_name);
    });
  }

  seleccionarDireccionPartida(sugerencia: string) {
    this.direccionPartida = sugerencia;
    this.mapsService.obtenerCoordenadasDireccion(sugerencia).subscribe((coords: [number, number]) => {
      this.partidaCoords = coords;
      this.map.setCenter(coords);
      this.agregarMarcador(coords);
      this.actualizarRuta();
    });
    this.sugerenciasPartida = [];
  }

  seleccionarDireccionDestino(sugerencia: string) {
    this.direccionDestino = sugerencia;
    this.mapsService.obtenerCoordenadasDireccion(sugerencia).subscribe((coords: [number, number]) => {
      this.destinoCoords = coords;
      this.agregarMarcador(coords);
      this.actualizarRuta();
    });
    this.sugerenciasDestino = [];
  }

  actualizarRuta() {
    if (this.partidaCoords && this.destinoCoords) {
      this.obtenerRuta();
    }
  }

  obtenerRuta() {
    if (this.partidaCoords && this.destinoCoords) {
      this.mapsService.obtenerRuta(this.partidaCoords, this.destinoCoords).subscribe((rutaCoords) => {
        const geojson = {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: rutaCoords,
          },
          properties: {},
        };

        if (!this.map.getSource('ruta')) {
          this.map.addSource('ruta', {
            type: 'geojson',
            data: geojson,
          });

          this.map.addLayer({
            id: 'ruta',
            type: 'line',
            source: 'ruta',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#007AFF',
              'line-width': 4,
            },
          });
        } else {
          const source = this.map.getSource('ruta') as mapboxgl.GeoJSONSource;
          source.setData(geojson);
        }

        if (this.partidaCoords && this.destinoCoords) {
          this.map.fitBounds([this.partidaCoords, this.destinoCoords], { padding: 50 });
        }
      });
    }
  }

  crearViaje() {
    // Guardar las direcciones en el servicio antes de navegar a la página de creación de viaje
    this.viajeDataService.setDirecciones(this.direccionPartida, this.direccionDestino);
    console.log('Creando viaje con:', this.direccionPartida, this.direccionDestino);
    // Navegar a la página de creación de viaje
    this.router.navigate(['/crear-viaje']);
  }
}
