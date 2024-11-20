import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Firebase Imports
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database'; // Realtime Database

// HTTP Client Import
import { HttpClientModule } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Services
import { MapsService } from './services/maps.service';
import { ViajeService } from './services/viaje.service';

// Ionic Storage Import
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(), // Configuración inicial de Ionic
    AppRoutingModule, // Configuración de rutas de la aplicación
    AngularFireModule.initializeApp(environment.firebaseConfig), // Inicializa Firebase
    AngularFireAuthModule, // Módulo de autenticación de Firebase
    AngularFirestoreModule, // Firestore
    AngularFireDatabaseModule, // Realtime Database
    HttpClientModule, // Cliente HTTP para solicitudes externas
    IonicStorageModule.forRoot(), // Configuración de Ionic Storage
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, // Estrategia de reutilización de rutas
    MapsService, // Servicio de mapas
    ViajeService, // Servicio de viajes
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Resuelve errores con elementos desconocidos
})
export class AppModule {}
