import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserLoginI } from 'src/app/models/authorization/usr_User';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/core/services/usuarios/user.service';
import { RoleI } from 'src/app/models/authorization/usr_roles';
import { UsuariosService } from 'src/app/core/services/dashboard/usuarios.service';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.css']
})
export class FormLoginComponent implements OnInit {
  displayMaximizable: boolean = true
  public formLogin: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });
  public motrar: boolean = false
  public formRegister: FormGroup = this.formBuilder.group({});
  public mostrar: boolean = false;
  selectedCities3: any[] = [];
  cities: RoleI[] = [];
  public image: string = 'assets/demo.png'
  blockSpecial: RegExp = /^[^<>*!@.,]+$/
  public Roles1: any[] = []
  public bandera: boolean = false
  public showProgressBar: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private http: HttpClient,
    private userService: UserService,
    private usuariosService: UsuariosService,
  ) { }

  ngOnInit(): void {
    const token: string | null = localStorage.getItem('token');
    const user: string | null = localStorage.getItem('user');
    if (token !== null && user !== null) {
      this.router.navigateByUrl('/landing');
    } else {
      this.router.navigateByUrl('/login');
    }

    const signUpButton: HTMLElement | null = document.getElementById('signUp');
    const signInButton: HTMLElement | null = document.getElementById('signIn');
    const container: HTMLElement | null = document.getElementById('container');

    if (signUpButton && signInButton && container) {
      signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
      });
      signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
      });
    }
    // var menu :string | null= localStorage.getItem('menu');
    if (token != null && user != null) {
      // this.showSuccess()
      let userObjeto: any = JSON.parse(user);
      // let menuObjeto:any = JSON.parse(menu); 
      let userLoginResponse = {
        user: userObjeto,
        token: token,
      }
      this.router.navigateByUrl('/welcome');
    } else { }
    this.buildForm();
  }

  onSubmitLogin() {
    this.showProgressBar = true;
    const form: UserLoginI = this.formLogin.value;
    const requestBody = JSON.stringify(form);

    this.authService.login(form).subscribe((result) => {
      if (result)
        this.motrar = true;
      if (result && result.data && result.data.user && result.data.user.name) {
        this.messageService.add({ severity: 'success', summary: `Bienvenido ${result.data.user.name}` });
      }

      var date = new Date('2020-01-01 00:00:04');
      function padLeft(n: any) {
        return n = "00".substring(0, "00".length - n.length) + n;
      }
      var interval = setInterval(() => {
        var minutes = padLeft(date.getMinutes() + "");
        var seconds = padLeft(date.getSeconds() + "");


        date = new Date(date.getTime() - 1000);
        if (minutes === '00' && seconds === '01') {
          this.showProgressBar = false;
          this.router.navigateByUrl('/landing');
          clearInterval(interval);
        }
      }, 1000);
    }, async error => {
      this.motrar = false;

      if (error != undefined) {
        if (error.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `Credenciales incorrectas` });
          this.showProgressBar = false;
        }
      }
    })
  }

  public verificar() {
    // e.preventDefault();
    let email = this.formRegister;

    let dominios = new Array('uniguajira.edu.co');

    // email.addEventListener('blur', function() {


    if (email.value.email1 == '' || email.value.email1 == 'undefined') {
      return false;

    } else {
      let value = email.value.email1.split('@'); //split() funciona para dividir una cadena en un array pasando un caracter como delimitador


      if (value[1] == undefined) {
        return false;
      } else {
        if (dominios.indexOf(value[1]) == -1) {
          dominios.forEach(function (dominio) { })
          this.messageService.add({ severity: 'warn', summary: 'Warn', detail: `El dominio aceptado es: ${dominios[0]}`, life: 1000 });

          return false;
        } else {
          return true;
        }
      }
    }
  }

  private buildForm() {
    this.formRegister = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email1: ['', [Validators.required]],
      password: ['', [Validators.required]],
      password2: ['', [Validators.required]],
    });
  }

  onSubmitRegister() {
    this.showProgressBar = true;
    let email = this.formRegister.value.email1;
    let formValue = {
      username: email.substring(0, email.indexOf('@')),
      first_name: this.formRegister.value.first_name,
      last_name: this.formRegister.value.last_name,
      email: this.formRegister.value.email1,
      password: this.formRegister.value.password,
    };
    if (this.formRegister.value.password !== this.formRegister.value.password2) {
      this.messageService.add({ severity: 'warn', summary: 'Alerta', detail: 'Las contraseñas no coinciden' });
      this.showProgressBar = false;
    } else {
      if (formValue.username != "" && formValue.email != "" && formValue.password != "") {
        this.bandera = true
        this.userService.createUser(formValue).subscribe(
          (user) => {
            var date = new Date('2020-01-01 00:00:03');
            function padLeft(n: any) {
              return n = "00".substring(0, "00".length - n.length) + n;
            }
            var interval = setInterval(() => {
              var minutes = padLeft(date.getMinutes() + "");
              var seconds = padLeft(date.getSeconds() + "");
              if (seconds == '03') {
                this.showProgressBar = false;
                this.messageService.add({ severity: 'success', summary: 'Registro', detail: 'Registro exitoso.' });
              }
              if (seconds == '01') {
                this.bandera = false
                this.userService.getUserDetailsByEmail(formValue.email).subscribe(
                  (userData) => {
                    if (userData) {
                      const userId = userData.id;
                      const userRoleData = {
                        status: true,
                        userId: userId,
                        rolesId: 3,
                      };
                      const bodyString = JSON.stringify(userRoleData);
                      const httpOptions = {
                        headers: new HttpHeaders({
                          'Content-Type': 'application/json'
                        })
                      };

                      this.usuariosService.asignarRoles(bodyString, httpOptions).subscribe(
                        (response) => {
                          if (response.status) {
                            this.messageService.add({ severity: 'success', summary: 'Registro', detail: 'Registro de estudiante exitoso.' });
                          }
                        },
                        (error) => {
                          console.error('Error al asignar el rol "autor" al usuario', error);
                          this.showProgressBar = false;
                        }
                      );
                    }
                  }
                )
              }

              date = new Date(date.getTime() - 1000);

            }, 1000);
          }, async (responseError) => {
            if (responseError.error && responseError.error.errors && responseError.error.errors.error) {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error. ${responseError.error.errors.error.person}` });
              this.showProgressBar = false;
            }
            this.bandera = false;
            this.showProgressBar = false;
          });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Faltan datos' });
        this.bandera = false
        this.showProgressBar = false;
      }
    }
  }

}
