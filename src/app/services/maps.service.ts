import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private mapboxUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor(private http: HttpClient) {}

  obtenerSugerencias(query: string): Observable<any> {
    const url = `${this.mapboxUrl}/${encodeURIComponent(query)}.json?access_token=${environment.mapbox.accessToken}&autocomplete=true&limit=5`;
    return this.http.get(url).pipe(
      map((response: any) => response)
    );
  }

  obtenerCoordenadasDireccion(direccion: string): Observable<[number, number]> {
    const url = `${this.mapboxUrl}/${encodeURIComponent(direccion)}.json?access_token=${environment.mapbox.accessToken}&limit=1`;
    return this.http.get(url).pipe(
      map((response: any) => {
        const [lng, lat] = response.features[0].geometry.coordinates;
        return [lng, lat];
      })
    );
  }

  obtenerRuta(partida: [number, number], destino: [number, number]): Observable<any> {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${partida.join(',')};${destino.join(',')}?geometries=geojson&access_token=${environment.mapbox.accessToken}`;
    return this.http.get(url).pipe(
      map((response: any) => response.routes[0].geometry.coordinates)
    );
  }
}
