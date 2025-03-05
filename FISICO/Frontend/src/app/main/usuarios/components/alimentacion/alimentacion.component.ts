import { Component, OnInit } from '@angular/core';
import { EntrenadorService } from 'src/app/core/services/usuarios/entrenador.service';
import { UserService } from 'src/app/core/services/usuarios/user.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { forkJoin } from 'rxjs';
import { User } from 'src/app/models/user/person';
import { Person } from 'src/app/models/user/person';

@Component({
  selector: 'app-alimentacion',
  templateUrl: './alimentacion.component.html',
  styleUrls: ['./alimentacion.component.css']
})
export class AlimentacionComponent implements OnInit {
  alimentos: any[] = [];
  usuarioId: number | undefined;
  public person: Person | null = null;
  public profileImage = '';

  public user: User = {
    id: 0,
    username: '',
    email: '',
    password: '',
    avatar: '',
  }

  constructor(
    private entrenadorService: EntrenadorService,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.usuarioId = this.authService.getUserId();
    this.loadUser();
    this.getAlimentacion();
  }

  getAlimentacion() {
      if (this.usuarioId != undefined) {
        this.entrenadorService.getAlimentacionesPorUsuario(this.usuarioId).subscribe((data) => {
          this.alimentos = data;
        });
      }
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

}
