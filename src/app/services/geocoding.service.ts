import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private accessToken = 'pk.eyJ1IjoibmFuZG9mYW1mIiwiYSI6ImNtM2JzamNjNDB4cGYyanBzYzZudTlyMmwifQ.wLGsjrc2Nsp0jk7G3blyjA';

  constructor(private http: HttpClient) {}

  getCoordinates(address: string): Observable<[number, number] | null> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.accessToken}`;

    return this.http.get<any>(url).pipe(
      map((response: any): [number, number] | null => {
        if (response.features && response.features.length > 0) {
          const [lng, lat] = response.features[0].geometry.coordinates;
          return [lng, lat] as [number, number];
        } else {
          console.error(`No se encontraron coordenadas para la dirección: ${address}`);
          return null;
        }
      }),
      catchError(error => {
        console.error('Error en la solicitud de geocodificación:', error);
        return of(null);
      })
    );
  }
}
