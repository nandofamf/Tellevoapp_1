import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private platform: Platform,
    private db: AngularFireDatabase // Añadir Firebase Database
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Habilitar modo offline para Firebase Database
      this.enableOfflinePersistence();

      // Controlar la visibilidad del menú según la ruta actual
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          if (event.url === '/home' || event.url === '/register') {
            this.menuCtrl.enable(false, 'first');
          } else {
            this.menuCtrl.enable(true, 'first');
          }
        }
      });
    });
  }

  enableOfflinePersistence() {
    // Configurar la base de datos en modo offline
    this.db.database.goOffline(); // Mantén la base de datos en estado offline cuando sea necesario

    // Si deseas que se conecte cuando haya conexión disponible
    this.platform.pause.subscribe(() => {
      this.db.database.goOffline();
    });

    this.platform.resume.subscribe(() => {
      this.db.database.goOnline();
    });
  }

  closeMenu() {
    this.menuCtrl.close('first');
  }
}
