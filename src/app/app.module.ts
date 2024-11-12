import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Firebase Imports
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// HTTP Client Import
import { HttpClientModule } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Services
import { MapsService } from './services/maps.service'; // Asegúrate de que esta ruta sea correcta
import { ViajeService } from './services/viaje.service';

// Ionic Storage Import
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    MapsService,
    ViajeService, // Agrega ViajeService como proveedor
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
