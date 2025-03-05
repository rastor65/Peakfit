import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { User, Person } from 'src/app/models/user/person';
import { UserService } from 'src/app/core/services/usuarios/user.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { forkJoin } from 'rxjs';
import { MedicionService } from 'src/app/core/services/usuarios/medicion.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  formData: any = {};
  estadoIMC: string = '';
  mediciones: any[] = [];
  public profileImage = '';
  esEdicion: boolean = false;
  usuarioId: number | undefined;
  dialogMedicion: boolean = false;
  public person: Person | null = null;

  public user: User = {
    id: 0,
    username: '',
    email: '',
    password: '',
    avatar: '',
  }

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private medicionService: MedicionService,
    private messageService: MessageService,) {
  }

  ngOnInit() {
    this.usuarioId = this.authService.getUserId();
    this.loadUser();
    this.cargarMediciones();
  }

  loadUser() {
    if (this.usuarioId !== undefined) {
      forkJoin({
        user: this.userService.loadUser(this.usuarioId),
        person: this.userService.getPeopleByUserId(this.usuarioId)
      }).subscribe(
        ({ user, person }) => {
          this.user = user.user;
          this.profileImage = user.profileImage;
          this.person = person.length > 0 ? person[0] : null;
        },
        error => {
          console.error('Error al cargar los datos:', error);
        }
      );
    }
  }

  cargarMediciones(): void {
    if (this.usuarioId !== undefined) {
      this.medicionService.obtenerMedicionesPorUsuario(this.usuarioId).subscribe({
        next: (data) => {
          this.mediciones = data;
        },
        error: (err) => {
          console.error('Error al cargar mediciones:', err);
        }
      });
    }
  }
  abrirMedicion() {
    this.esEdicion = true;
    this.formData = {};
    this.dialogMedicion = true;
  }

  verMedicion(medicion: any) {
    this.esEdicion = false;
    this.formData = { ...medicion };
    this.dialogMedicion = true;
  }

  editarMedicion(medicion: any) {
    this.esEdicion = true;
    this.formData = { ...medicion };
    this.dialogMedicion = true;
  }

  cerrarMedicion() { this.dialogMedicion = false; }

  guardarMedicion() {
    if (this.formData) {
      if (this.formData.id) {
        this.medicionService.actualizarMedicion(this.formData.id, this.formData).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medición actualizada' });
          this.cargarMediciones();
          this.dialogMedicion = false;
        });
      } else {
        this.formData.usuario = this.usuarioId;
        this.medicionService.crearMedicion(this.formData).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medición creada' });
          this.cargarMediciones();
          this.dialogMedicion = false;
        });
      }
    } else {
      console.log("ERRRROR EN EL FORM")
    }
  }

  eliminarMedicion(medicion: any) {
    if (confirm('¿Está seguro de eliminar esta medición?')) {
      this.medicionService.eliminarMedicion(medicion.id).subscribe(() => {
        this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: 'Medición eliminada' });
        this.cargarMediciones();
      });
    }
  }

  getIMCClass(imc: number): string {
    if (imc < 18.5) {
      return 'bajo-peso';
    } else if (imc >= 18.5 && imc <= 24.9) {
      return 'normal';
    } else if (imc >= 25 && imc <= 29.9) {
      return 'sobrepeso';
    } else {
      return 'obesidad';
    }
  }

  mostrarEstadoIMC(imc: number): void {
    if (imc < 18.5) {
      this.estadoIMC = 'Bajo Peso';
    } else if (imc >= 18.5 && imc <= 24.9) {
      this.estadoIMC = 'Normal';
    } else if (imc >= 25 && imc <= 29.9) {
      this.estadoIMC = 'Sobrepeso';
    } else {
      this.estadoIMC = 'Obesidad';
    }

    setTimeout(() => {
      this.estadoIMC = '';
    }, 3000);
  }

}