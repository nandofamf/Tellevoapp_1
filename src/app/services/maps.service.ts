import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MapsService {
  constructor(private http: HttpClient) {}

  obtenerSugerenciasDireccion(direccion: string) {
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Reemplaza con tu API key de Google Maps
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${direccion}&key=${apiKey}`;
    return this.http.get(url);
  }
}
