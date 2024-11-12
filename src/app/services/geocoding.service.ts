import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private mapboxToken = 'pk.eyJ1IjoibmFuZG9mYW1mIiwiYSI6ImNtM2JzamNjNDB4cGYyanBzYzZudTlyMmwifQ.wLGsjrc2Nsp0jk7G3blyjA';

  constructor(private http: HttpClient) {}

  getCoordinates(address: string): Observable<[number, number]> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.mapboxToken}`;
    return this.http.get<any>(url).pipe(
      map((response: any) => response.features[0]?.center || null)
    );
  }

  getRoute(start: [number, number], end: [number, number]): Promise<[number, number][]> {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${this.mapboxToken}`;
    return this.http.get(url).toPromise().then((response: any) => {
      return response.routes[0].geometry.coordinates;
    });
  }
}
