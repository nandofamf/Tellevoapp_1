import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  usr = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '' // Solo el número, sin el prefijo
  };

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  async onRegisterSubmit() {
    const { email, password, confirmPassword, fullName, phoneNumber } = this.usr;

    // Verificación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      // Concatenar el prefijo al número de teléfono
      const fullPhoneNumber = `569${phoneNumber}`;

      // Guardar datos adicionales en Firestore
      await this.firestore.collection('users').doc(userCredential.user?.uid).set({
        fullName: fullName,
        email: email,
        phoneNumber: fullPhoneNumber,
        uid: userCredential.user?.uid
      });

      // Alerta de éxito y redirección a la página de inicio
      const alert = await this.alertCtrl.create({
        header: 'Registro exitoso',
        message: 'Te has registrado correctamente.',
        buttons: ['OK']
      });
      await alert.present();
      this.navCtrl.navigateForward('/home');
    } catch (error: any) {
      // Manejo de errores
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: error.message,
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
