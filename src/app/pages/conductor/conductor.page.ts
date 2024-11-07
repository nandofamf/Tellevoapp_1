import { Component, OnInit } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { ViajeService } from '../../services/viaje.service';
import { Geolocation } from '@capacitor/geolocation';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import axios from 'axios';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.page.html',
  styleUrls: ['./conductor.page.scss'],
})
export class ConductorPage implements OnInit {
  map!: mapboxgl.Map;
  partida: [number, number] = [-74.006, 40.7128];
  destinoCoord: [number, number] = [-73.935242, 40.73061];
  viaje: any = null;
  pasajeros: any[] = [];
  marcadorConductor!: mapboxgl.Marker;
  userId: string | null = null;

  constructor(
    private viajeService: ViajeService,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const currentUser = await this.auth.currentUser;
    if (currentUser) {
      this.userId = currentUser.uid;
      this.obtenerViajeConductor();
      this.inicializarMapa();
      this.obtenerPasajeros();
      this.trackRealTimeLocation();
    }
  }

  inicializarMapa() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.partida,
      zoom: 12,
    });

    this.map.on('load', () => {
      this.dibujarRuta();
    });
  }

  async dibujarRuta() {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${this.partida[0]},${this.partida[1]};${this.destinoCoord[0]},${this.destinoCoord[1]}`,
        {
          params: {
            access_token: environment.mapbox.accessToken,
            geometries: 'geojson',
          },
        }
      );

      const route = response.data.routes[0].geometry.coordinates;

      if (this.map.getSource('route')) {
        (this.map.getSource('route') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route,
          },
        });
      } else {
        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route,
            },
          },
        });

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#007aff',
            'line-width': 4,
          },
        });
      }

      // Agregar marcador en la partida
      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat(this.partida)
        .setPopup(new mapboxgl.Popup().setText('Partida'))
        .addTo(this.map);

      // Agregar marcador en el destino
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(this.destinoCoord)
        .setPopup(new mapboxgl.Popup().setText('Destino'))
        .addTo(this.map);
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
    }
  }

  obtenerViajeConductor() {
    if (this.userId) {
      this.viajeService.obtenerViajes().subscribe((viajes) => {
        this.viaje = viajes.find((v: any) => v.conductorId === this.userId);
        if (this.viaje) {
          this.partida = [this.viaje.direccionPartida.lng, this.viaje.direccionPartida.lat];
          this.destinoCoord = [this.viaje.direccionDestino.lng, this.viaje.direccionDestino.lat];
          this.dibujarRuta();
        }
      });
    }
  }

  obtenerPasajeros() {
    if (this.userId) {
      this.viajeService.obtenerPasajerosEnTiempoReal(this.userId).subscribe((pasajeros: any[]) => {
        this.pasajeros = pasajeros;
      });
    }
  }

  async trackRealTimeLocation() {
    const position = await Geolocation.getCurrentPosition();
    this.updateConductorLocation(position.coords.latitude, position.coords.longitude);

    Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        this.updateConductorLocation(position.coords.latitude, position.coords.longitude);
      }
    });
  }

  updateConductorLocation(lat: number, lng: number) {
    const nuevaUbicacion: [number, number] = [lng, lat];

    if (this.marcadorConductor) {
      this.marcadorConductor.setLngLat(nuevaUbicacion);
    } else {
      this.marcadorConductor = new mapboxgl.Marker({ color: 'green' })
        .setLngLat(nuevaUbicacion)
        .addTo(this.map);
    }

    this.map.setCenter(nuevaUbicacion);
  }

  async aceptarPasajero(pasajero: any) {
    try {
      const pedido = {
        ...pasajero,
        conductorId: this.userId,
        estado: 'aceptado',
        fecha: new Date(),
      };
  
      const batch = this.firestore.firestore.batch();
      const historialRef = this.firestore.collection('historial').doc().ref;
      batch.set(historialRef, pedido); // Agrega el viaje al historial
  
      const solicitudRef = this.firestore.collection('historial').doc(pasajero.id).ref;
      batch.delete(solicitudRef); // Elimina la solicitud original
  
      await batch.commit(); // Ejecuta la operación en lote
  
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'El pasajero ha sido aceptado y registrado en el historial.',
        buttons: ['OK']
      });
      await alert.present();
  
      this.obtenerPasajeros(); // Refresca la lista de pasajeros
    } catch (error) {
      console.error('Error al aceptar el pasajero:', error);
    }
  }
  
  async rechazarPasajero(pasajero: any) {
    try {
      await this.firestore.collection('historial').doc(pasajero.id).delete(); // Elimina la solicitud directamente
  
      const alert = await this.alertController.create({
        header: 'Rechazado',
        message: 'El pasajero ha sido rechazado y su solicitud eliminada.',
        buttons: ['OK']
      });
      await alert.present();
  
      this.obtenerPasajeros(); // Refresca la lista de pasajeros
    } catch (error) {
      console.error('Error al rechazar el pasajero y eliminar su solicitud:', error);
    }
  }
}  