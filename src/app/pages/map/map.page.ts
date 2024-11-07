import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  partida: [number, number] = [0, 0]; // Coordenadas de partida
  destino: [number, number] = [0, 0]; // Coordenadas de destino
  map!: mapboxgl.Map; // Utiliza la declaración estricta

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      try {
        this.partida = JSON.parse(params['partida']);
        this.destino = JSON.parse(params['destino']);
      } catch (error) {
        console.error('Error al parsear coordenadas:', error);
      }
      
      if (this.isValidCoordinates(this.partida) && this.isValidCoordinates(this.destino)) {
        this.initializeMap();
      } else {
        console.error('Formato incorrecto de coordenadas:', this.partida, this.destino);
      }
    });
  }

  initializeMap() {
    (mapboxgl as any).accessToken = 'TU_MAPBOX_ACCESS_TOKEN';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.partida,
      zoom: 12,
    });

    // Marcadores para partida y destino
    new mapboxgl.Marker({ color: 'green' })
      .setLngLat(this.partida)
      .addTo(this.map);

    new mapboxgl.Marker({ color: 'red' })
      .setLngLat(this.destino)
      .addTo(this.map);

    // Ajustar el mapa para que ambos puntos sean visibles
    this.map.fitBounds([this.partida, this.destino], { padding: 50 });
  }

  isValidCoordinates(coords: any): coords is [number, number] {
    return Array.isArray(coords) && coords.length === 2 &&
           typeof coords[0] === 'number' && typeof coords[1] === 'number';
  }
}
