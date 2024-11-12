// auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // Obtener el correo electrónico del usuario autenticado sin caracteres especiales
  getUserEmail(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      map(user => {
        if (user && user.email) {
          // Remueve caracteres especiales y convierte el correo a minúsculas
          return user.email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        }
        return null;
      })
    );
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
    return this.afAuth.authState.pipe(map(user => !!user));
  }
}
