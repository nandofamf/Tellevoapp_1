import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController, NavController } from '@ionic/angular';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Feature, LineString } from 'geojson';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {
  direccionPartidaInput: string = '';
  direccionDestinoInput: string = '';
  direccionPartida: any = {};
  direccionDestino: any = {};
  capacidad: number = 0;
  costo: number = 0;
  patente: string = '';
  modelo: string = '';
  map!: mapboxgl.Map;

  lugaresPartida: any[] = [];
  lugaresDestino: any[] = [];
  partidaMarker!: mapboxgl.Marker;
  destinoMarker!: mapboxgl.Marker;

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private alertController: AlertController,
    private http: HttpClient,
    private storage: Storage,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 300); // Retraso para asegurar que el contenedor esté renderizado
  }

  inicializarMapa() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;

    const mapContainer = document.getElementById('map-crear-viaje');
    if (mapContainer) {
      this.map = new mapboxgl.Map({
        container: 'map-crear-viaje',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-70.64827, -33.45694], // Coordenadas iniciales (Santiago, Chile)
        zoom: 10,
      });

      this.map.on('load', () => {
        this.map.resize(); // Redimensiona el mapa cuando se carga
      });

      this.map.on('click', (event) => this.establecerMarcador(event.lngLat));
    } else {
      console.error('Contenedor del mapa no encontrado');
    }
  }

  establecerMarcador(lngLat: mapboxgl.LngLat) {
    if (!this.direccionPartida.lat && !this.direccionPartida.lng) {
      // Establecer partida
      this.direccionPartida = { lat: lngLat.lat, lng: lngLat.lng };
      this.partidaMarker = new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(this.map);
    } else if (!this.direccionDestino.lat && !this.direccionDestino.lng) {
      // Establecer destino
      this.direccionDestino = { lat: lngLat.lat, lng: lngLat.lng };
      this.destinoMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([lngLat.lng, lngLat.lat])
        .addTo(this.map);

      // Dibujar la ruta
      this.obtenerRuta();
    }
  }

  buscarLugar(tipo: string, event: any) {
    const query = event.target.value.trim();
    if (query.length > 0) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${environment.mapbox.accessToken}&autocomplete=true&limit=5`;
      this.http.get(url).subscribe((res: any) => {
        if (tipo === 'partida') {
          this.lugaresPartida = res.features;
        } else {
          this.lugaresDestino = res.features;
        }
      });
    } else {
      if (tipo === 'partida') {
        this.lugaresPartida = [];
      } else {
        this.lugaresDestino = [];
      }
    }
  }

  seleccionarLugar(tipo: string, lugar: any) {
    const [lng, lat] = lugar.center;
    if (tipo === 'partida') {
      this.direccionPartida = { lat, lng, place_name: lugar.place_name };
      this.direccionPartidaInput = lugar.place_name;
      this.lugaresPartida = [];

      if (this.partidaMarker) this.partidaMarker.remove();
      this.partidaMarker = new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([lng, lat])
        .addTo(this.map);
    } else {
      this.direccionDestino = { lat, lng, place_name: lugar.place_name };
      this.direccionDestinoInput = lugar.place_name;
      this.lugaresDestino = [];

      if (this.destinoMarker) this.destinoMarker.remove();
      this.destinoMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .addTo(this.map);
    }

    this.map.flyTo({ center: [lng, lat], zoom: 14 });

    if (this.direccionPartida && this.direccionDestino) {
      this.obtenerRuta();
    }
  }

  obtenerRuta() {
    if (
        this.direccionPartida &&
        this.direccionPartida.lng !== undefined &&
        this.direccionPartida.lat !== undefined &&
        this.direccionDestino &&
        this.direccionDestino.lng !== undefined &&
        this.direccionDestino.lat !== undefined
    ) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.direccionPartida.lng},${this.direccionPartida.lat};${this.direccionDestino.lng},${this.direccionDestino.lat}?geometries=geojson&access_token=${environment.mapbox.accessToken}`;

        this.http.get(url).subscribe(
            (response: any) => {
                const ruta = response.routes[0].geometry;

                if (this.map.getSource('route')) {
                    (this.map.getSource('route') as mapboxgl.GeoJSONSource).setData(ruta);
                } else {
                    this.map.addSource('route', {
                        type: 'geojson',
                        data: ruta,
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
                            'line-dasharray': [2, 2], // Línea de puntos
                        },
                    });
                }
            },
            (error) => {
                console.error("Error al obtener la ruta:", error);
            }
        );
    } else {
        console.warn("Las coordenadas de partida o destino no están definidas.");
    }
}


  async crearViaje() {
    const currentUser = await this.auth.currentUser;
    if (!currentUser) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo autenticar al usuario.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (!this.costo || !this.patente || !this.modelo) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos obligatorios.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const viaje = {
      direccionPartida: this.direccionPartida,
      direccionDestino: this.direccionDestino,
      capacidad: this.capacidad,
      costo: this.costo,
      asientosOcupados: 0,
      estado: 'pendiente',
      conductorId: currentUser.uid,
      timestamp: new Date(),
    };

    try {
      await this.firestore.collection('viajes').add(viaje);

      const alert = await this.alertController.create({
        header: 'Viaje Creado',
        message: 'Se ha creado el viaje con éxito.',
        buttons: ['OK'],
      });
      await alert.present();

      this.navCtrl.navigateBack('/conductor');
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un error al crear el viaje. Intenta nuevamente.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  convertirMayusculas(event: any) {
    this.patente = event.target.value.toUpperCase();
  }
}
