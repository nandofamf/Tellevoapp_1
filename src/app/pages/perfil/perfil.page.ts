import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; // Asegúrate de importar la autenticación de Firebase

interface Usuario {
  username: string;
  email: string;
  telefono: string;
  fotoPerfilUrl: string | null;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  usuario: Usuario = {
    username: '',
    email: '',
    telefono: '',
    fotoPerfilUrl: null
  };
  imagenPerfil: string | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create(); // Inicializar Ionic Storage
    await this.loadProfile(); // Cargar el perfil desde Ionic Storage
  }

  // Función para cargar el perfil desde Firebase y almacenarlo en Ionic Storage
  async loadProfile() {
    const storedProfile = await this.storage.get('usuario');
    if (storedProfile) {
      this.usuario = storedProfile;
      this.imagenPerfil = this.usuario.fotoPerfilUrl;
    } else {
      this.getUserProfileFromFirebase();
    }
  }

  // Obtener el perfil desde Firebase y guardarlo en Ionic Storage
  getUserProfileFromFirebase() {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users').doc<Usuario>(user.uid).valueChanges();
        } else {
          return of(null);
        }
      })
    ).subscribe(async (data: Usuario | null | undefined) => {
      if (data) {
        this.usuario = {
          username: data.username || '',
          email: data.email || '',
          telefono: data.telefono || '',
          fotoPerfilUrl: data.fotoPerfilUrl || null
        };
        this.imagenPerfil = this.usuario.fotoPerfilUrl;

        // Guardar los datos en Ionic Storage
        await this.storage.set('usuario', this.usuario);
      }
    });
  }

  // Seleccionar imagen de perfil y guardarla en Firebase e Ionic Storage
  async seleccionarImagen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenPerfil = e.target.result;
          this.guardarImagenPerfil(e.target.result); // Guardar la imagen en Firebase e Ionic Storage
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  // Guardar imagen de perfil en Firebase y Ionic Storage
  async guardarImagenPerfil(imagenDataUrl: string) {
    const user = await this.afAuth.currentUser;
    if (user) {
      await this.firestore.collection('users').doc(user.uid).update({
        fotoPerfilUrl: imagenDataUrl
      });
      this.usuario.fotoPerfilUrl = imagenDataUrl;
      await this.storage.set('usuario', this.usuario); // Guardar también en Ionic Storage
    }
  }

  // Cambiar la contraseña del usuario
  async cambiarContrasena() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña Actual'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva Contraseña'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar Contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.newPassword === data.confirmPassword) {
              await this.reauthenticateAndChangePassword(data.currentPassword, data.newPassword);
            } else {
              const alert = await this.alertController.create({
                header: 'Error',
                message: 'Las contraseñas nuevas no coinciden.',
                buttons: ['OK']
              });
              await alert.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async reauthenticateAndChangePassword(currentPassword: string, newPassword: string) {
    const user = await this.afAuth.currentUser;
    if (user && user.email) {
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
  
      try {
        // Reautenticación con la contraseña actual
        await user.reauthenticateWithCredential(credential);
        
        // Si la reautenticación es exitosa, actualiza la contraseña
        await user.updatePassword(newPassword);
  
        const successAlert = await this.alertController.create({
          header: 'Éxito',
          message: 'Contraseña actualizada correctamente.',
          buttons: ['OK']
        });
        await successAlert.present();
  
      } catch (error: any) {
        // Verificar si el error es específicamente de contraseña incorrecta
        let errorMessage = 'La contraseña actual es incorrecta o no se pudo actualizar.';
        
        if (error.code === 'auth/wrong-password') {
          errorMessage = 'La contraseña actual no coincide. Por favor, inténtalo de nuevo.';
        }
  
        const alertError = await this.alertController.create({
          header: 'Error',
          message: errorMessage,
          buttons: ['OK']
        });
        await alertError.present();
      }
    }
  }
  
  // Editar perfil y guardar cambios en Firebase e Ionic Storage
  async editarPerfil() {
    const alert = await this.alertController.create({
      header: 'Guardar Cambios',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Nombre',
          value: this.usuario.username
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo',
          value: this.usuario.email
        },
        {
          name: 'telefono',
          type: 'text',
          placeholder: 'Teléfono',
          value: this.usuario.telefono
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Edición cancelada');
          }
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            this.usuario.username = data.username;
            this.usuario.email = data.email;
            this.usuario.telefono = data.telefono;

            const user = await this.afAuth.currentUser;
            if (user) {
              await this.firestore.collection('users').doc(user.uid).update({
                username: data.username,
                email: data.email,
                telefono: data.telefono
              });
              await this.storage.set('usuario', this.usuario); // Guardar en Ionic Storage
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Cerrar sesión
  cerrarSesion() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/home']);
    });
  }
}
