import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  viajes: any[] = [];

  constructor(private db: AngularFireDatabase) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.db.list('viajes').valueChanges().subscribe((data: any[]) => {
      this.viajes = data;
    });
  }
}
