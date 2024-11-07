import { Component, ViewChild } from '@angular/core';
import { register } from 'swiper/element/bundle';
import Swiper from 'swiper';

register();

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {
  @ViewChild('swiper') swiper?: Swiper;
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  password: string = '';
  canProceed: boolean = false;

 
  nextSlide() {
    if (this.swiper) {
      this.swiper.slideNext();
    }
  }

   
  Validar() {
    const nombreValido = this.nombre.length >= 2;
    const apellidoValido = this.apellido.length >= 2;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);  
    const passwordValido = this.password.length >= 8;  

     
    this.canProceed = nombreValido && apellidoValido && emailValido && passwordValido;
  }

 
  registrarUsuario() {
    if (this.canProceed) {
      console.log('Registrando usuario con:', this.nombre, this.apellido, this.email, this.password);
      
    } else {
      console.log('Por favor, completa todos los campos correctamente.');
    }
  }
}
