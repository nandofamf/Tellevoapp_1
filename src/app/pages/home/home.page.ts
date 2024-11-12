import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  usr = {
    email: '',
    password: ''
  };

  constructor(
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  async onLoginSubmit() {
    const { email, password } = this.usr;

    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      console.log('Inicio de sesión exitoso:', userCredential);
      this.navCtrl.navigateForward('/role-selection');
    } catch (error: any) {
      // Personalizar el mensaje de error según el código de error
      let errorMessage = 'Contraseña o usuario incorrecto. Por favor, verifica e intenta de nuevo.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'La contraseña es incorrecta. Por favor, verifica e intenta de nuevo.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No se encontró una cuenta con este correo electrónico.';
      }

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  navigateToRegister() {
    this.navCtrl.navigateForward('/register');
  }
}
