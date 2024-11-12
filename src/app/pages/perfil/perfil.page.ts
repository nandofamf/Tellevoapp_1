import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

interface Usuario {
  fullName: string;
  email: string;
  phoneNumber: string;
  fotoPerfilUrl: string | null;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  usuario: Usuario = {
    fullName: '',
    email: '',
    phoneNumber: '',
    fotoPerfilUrl: null
  };
  imagenPerfil: string | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: Storage,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.loadProfile();
  }

  loadProfile() {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          // Obtener los datos del usuario actual desde Firestore usando su UID
          return this.firestore.collection('users').doc<Usuario>(user.uid).valueChanges();
        } else {
          return of(null);
        }
      })
    ).subscribe(async (data: Usuario | null | undefined) => {
      if (data) {
        this.usuario = {
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          fotoPerfilUrl: data.fotoPerfilUrl || null
        };
        this.imagenPerfil = this.usuario.fotoPerfilUrl;

        // Guardar los datos en Ionic Storage para accesos futuros
        await this.storage.set('usuario', this.usuario);
      } else {
        console.error('No se pudo cargar la información del usuario');
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

  // Editar perfil y guardar cambios en Firebase e Ionic Storage
  async editarPerfil() {
    const alert = await this.alertController.create({
      header: 'Guardar Cambios',
      inputs: [
        {
          name: 'fullName',
          type: 'text',
          placeholder: 'Nombre Completo',
          value: this.usuario.fullName
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo Electrónico',
          value: this.usuario.email
        },
        {
          name: 'phoneNumber',
          type: 'text',
          placeholder: 'Teléfono',
          value: this.usuario.phoneNumber
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
            this.usuario.fullName = data.fullName;
            this.usuario.email = data.email;
            this.usuario.phoneNumber = data.phoneNumber;

            const user = await this.afAuth.currentUser;
            if (user) {
              await this.firestore.collection('users').doc(user.uid).update({
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber
              });
              await this.storage.set('usuario', this.usuario); // Guardar en Ionic Storage
            }
          }
        }
      ]
    });

    await alert.present();
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
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
  
        const successAlert = await this.alertController.create({
          header: 'Éxito',
          message: 'Contraseña actualizada correctamente.',
          buttons: ['OK']
        });
        await successAlert.present();
  
      } catch (error: any) {
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

  // Cerrar sesión
  cerrarSesion() {
    this.afAuth.signOut().then(() => {
      this.navCtrl.navigateForward('/home');
    });
  }
}
