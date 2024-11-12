import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // Método para obtener el usuario actual (logged in user)
  getUser(): Promise<any> {
    return this.afAuth.authState.toPromise();
  }

  // Método para iniciar sesión con correo y contraseña
  login(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Método para registrarse con correo y contraseña
  register(email: string, password: string): Promise<any> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Método para cerrar sesión
  logout(): Promise<void> {
    return this.afAuth.signOut();
  }

  // Método para verificar si hay un usuario autenticado
  isAuthenticated(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.afAuth.authState.subscribe(user => {
        observer.next(!!user);
      });
    });
  }
}
