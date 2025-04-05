import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/core/services/dashboard/usuarios.service';
import { environment } from 'src/environments/environment';
import { MedicionService } from 'src/app/core/services/usuarios/medicion.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Medicion } from 'src/app/models/medicion';
import { MessageService } from 'primeng/api';
import { EntrenadorService } from 'src/app/core/services/usuarios/entrenador.service';
import { ConfirmationService } from 'primeng/api';
import { UserService } from 'src/app/core/services/usuarios/user.service';
import { Observable } from 'rxjs';
import { Person } from 'src/app/models/user/person';
import { tablaMaestra } from 'src/app/models/user/person';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-entrenador',
  templateUrl: './entrenador.component.html',
  styleUrls: ['./entrenador.component.css']
})

export class EntrenadorComponent implements OnInit {

  API_URI = environment.API_URI;
  base_user = `${this.API_URI}/api/user/`;

  personas: Person[] = [];
  personasFiltradas: Person[] = [];
  formData: any = {};
  estadoIMC: string = '';
  alimentacion: any[] = [];
  cargando: boolean = true;
  entrenamiento: any[] = [];
  alimentaciones: any[] = [];
  entrenamientos: any[] = [];
  esEdicion: boolean = false;
  selectedTrainer: any = null;
  public trainers: any[] = [];
  public mediciones: any[] = [];
  usuarioId: number | undefined;
  dialogMedicion: boolean = false;
  public searchValue: string = '';
  public filterOptions: any[] = [];
  selectedAlimentacion: any = null;
  ciudad: tablaMaestra[] = [];
  selectedEntrenamiento: any = null;
  medicionesUsuario: Medicion[] = [];
  dialogAlimentacion: boolean = false;
  public filteredTrainers: any[] = [];
  public filteredTrainers2: any[] = [];
  dialogEntrenamiento: boolean = false;
  dialogVerAlimentacion: boolean = false;
  esEdicionAlimentacion: boolean = false;
  esEdicionEntrenamiento: boolean = false;
  dialogVerEntrenamiento: boolean = false;
  public dialogMediciones: boolean = false;
  dialogAlimentacionRegion: boolean = false;
  dialogEntrenamientoRegion: boolean = false;
  dialogFormularioEntrenamiento: boolean = false;
  dialogFormularioAlimentacion: boolean = false;
  public cargandoEntrenamiento: boolean = false;
  formAlimentacion = {
    id: 0,
    nombre: '',
    descripcion: '',
    calorias_diarias: 0,
    entrenador: '',
    usuario: ''
  };

  tiposEjercicio = [
    'RESISTENCIA',
    'CARDIOVASCULAR',
    'EJERCICIOS FORTALECIMIENTO',
    'EJERCICIOS DE EQUILIBRIO',
    'FLEXIBILIDAD'
  ];

  diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

  formEntrenamiento = {
    id: null,
    usuario: null,
    nombre: '',
    duracion_semanas: 1,
    entrenador: null,
    descripcion: '',
    semanas: [] as any[]
  };

  constructor(
    private usuariosService: UsuariosService,
    private medicionService: MedicionService,
    private messageService: MessageService,
    private entrenadorService: EntrenadorService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getTrainers();
    this.getFilterOptions();
    this.getMediciones();
    this.obtenerTipos();
  }

  generarSemanas() {
    this.formEntrenamiento.semanas = [];
    for (let i = 0; i < this.formEntrenamiento.duracion_semanas; i++) {
      const semana = {
        numero: i + 1,
        ejercicios: this.tiposEjercicio.map(tipo => ({
          tipo,
          dias: this.diasSemana.map(() => false) // Array de booleanos para los días
        }))
      };
      this.formEntrenamiento.semanas.push(semana);
    }
  }

  editarSugerenciaDesdeFrontend(ejercicio: any, dia: string) {
    this.entrenadorService.editarSugerencia(ejercicio.tipo, dia).subscribe((res) => {
      if (!ejercicio.sugerencias) {
        ejercicio.sugerencias = {};
      }
      ejercicio.sugerencias[dia] = res.sugerencias; this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Sugerencias actualizada' });
    }, (error) => {
      console.error('Error al editar sugerencia:', error);
      this.messageService.add({
        severity: 'error', summary: 'Error', detail: 'No se pudo editar la sugerencia.'

      });
    });
  }

  onCheckboxChange(ejercicio: any, dia: string, activo: boolean) {
    if (activo) {
      if (this.esEdicionEntrenamiento) {
        this.editarSugerenciaDesdeFrontend(ejercicio, dia);
      } else { // Si estás en modo creación, simplemente inicializa las sugerencias localmente 
        if (!ejercicio.sugerencias) {
          ejercicio.sugerencias = {};
        }
        ejercicio.sugerencias[dia] = []; // vacío o deja para que el backend las genere al guardar
      }
    } else if (ejercicio.sugerencias) {
      delete ejercicio.sugerencias[dia];
    }
  }

  public obtenerTipos(): void {
    this.userService.obtenerTipoCategoria().subscribe(
      (categorias: any[]) => {
        const categoriaMap = categorias.reduce((acc, categoria) => {
          acc[categoria.id] = categoria.nombre;
          return acc;
        }, {} as Record<number, string>);

        this.userService.obtenerTipo().subscribe(
          (tipos: any[]) => {
            this.ciudad = tipos.filter(tipo => categoriaMap[tipo.categoria] === "Ciudad");
          },
          (error: any) => {
            console.error(error);
          }
        );
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getTrainers(): void {
    this.cargando = true;
    this.usuariosService.getAllRoles().subscribe(
      (response: any) => {
        const unique = new Map();
        response.forEach((item: any) => {
          const email = item.userId.email;
          if (!unique.has(email)) {
            unique.set(email, item);
          }
        });
        this.trainers = Array.from(unique.values());
        this.filteredTrainers = this.trainers;
        console.log(this.filteredTrainers)
        this.filteredTrainers2 = this.trainers.filter(trainer => trainer.userId?.roles?.includes(3))
        console.log("entrendaores: ", this.filteredTrainers2)
        this.cargando = false;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getFilterOptions(): void {
    this.usuariosService.getRoles().subscribe(
      (response: any) => {
        this.filterOptions = [{ name: 'Todos' }, ...response];
      },
      (error: any) => console.error(error)
    );
  }

  verAlimentacion(trainer: any) {
    this.selectedTrainer = trainer;
    this.entrenadorService.getAlimentacionesPorUsuario(trainer.userId.id).subscribe(
      (data) => {
        this.alimentaciones = data;
        this.dialogAlimentacion = true;
        this.alimentaciones.forEach((alimentacion: any) => {
          if (alimentacion.entrenador) {
            this.getNombre(alimentacion.entrenador).subscribe((persona: any) => {
              if (persona.length > 0) {
                alimentacion.entrenador = `${persona[0].nombres} ${persona[0].apellidos}`;
              } else {
                alimentacion.entrenador = "Desconocido"; // Si no hay datos
              }
            });
          }
          if (alimentacion.usuario) {
            this.getNombre(alimentacion.usuario).subscribe((persona: any) => {
              if (persona.length > 0) {
                alimentacion.usuario = `${persona[0].nombres} ${persona[0].apellidos}`;
              } else {
                alimentacion.usuario = "Desconocido"; // Si no hay datos
              }
            });
          }
        });
      },
      (error) => console.error(error)
    );
  }

  getNombre(entrenadorId: number): Observable<Person[]> {
    return this.userService.getPeopleByUserId(entrenadorId);
  }

  verUnaAlimentacion(alimentacion: any) {
    this.selectedAlimentacion = alimentacion;
    this.entrenadorService.getOneAlimentacion(alimentacion.id).subscribe(
      (data) => {
        this.alimentacion = data;
        console.log(this.alimentacion)
        this.dialogVerAlimentacion = true;
      },
      (error) => console.error(error)
    );
  }

  verUnEntrenamiento(entrenamiento: any) {
    this.selectedEntrenamiento = entrenamiento;
    this.entrenadorService.getOneEntrenamiento(entrenamiento.id).subscribe(
      (data) => {
        this.entrenamiento = data;
        console.log(this.entrenamiento)
        this.dialogVerEntrenamiento = true;
      },
      (error) => console.error(error)
    );
  }

  agregarAlimentacion() {
    if (this.selectedTrainer) {
      this.formData.usuario = this.selectedTrainer.userId.id;
      this.entrenadorService.createAlimentacion(this.formData).subscribe(
        (data) => {
          this.alimentaciones.push(data);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alimentación añadida' });
          this.formData = {};
        },
        (error) => console.error(error)
      );
    }
  }

  abrirFormularioAlimentacion(alimentacion?: any) {
    if (alimentacion) {
      this.formAlimentacion = { ...alimentacion };
      this.esEdicionAlimentacion = true;
    } else {
      this.formAlimentacion = {
        id: 0,
        nombre: '',
        descripcion: '',
        calorias_diarias: 0,
        entrenador: '',
        usuario: ''
      };
      this.esEdicionAlimentacion = false;
    }
    this.dialogFormularioAlimentacion = true;
  }

  abrirFormularioEntrenamiento(entrenamiento?: any) {
    if (entrenamiento) {
      this.formEntrenamiento = {
        ...entrenamiento,
        entrenador: typeof entrenamiento.entrenador === 'object' ? entrenamiento.entrenador.id : entrenamiento.entrenador,
        usuario: typeof entrenamiento.usuario === 'object' ? entrenamiento.usuario.id : entrenamiento.usuario
      };

      // Reprocesar sugerencias basadas en los días activos
      this.formEntrenamiento.semanas.forEach((semana: any) => {
        semana.ejercicios.forEach((ejercicio: any) => {
          const nuevasSugerencias: { [key: string]: string[] } = {};
          ejercicio.dias.forEach((activo: boolean, index: number) => {
            const dia = this.diasSemana[index];
            if (activo) {
              if (ejercicio.sugerencias && ejercicio.sugerencias[dia]) {
                // Mantener sugerencia existente si ya estaba
                nuevasSugerencias[dia] = ejercicio.sugerencias[dia];
              } else {
                // Generar nueva sugerencia
                nuevasSugerencias[dia] = this.generarSugerencia(ejercicio.tipo, dia);
              }
            }
          });
          ejercicio.sugerencias = nuevasSugerencias;
        });
      });

      this.esEdicionEntrenamiento = true;
    } else {
      this.formEntrenamiento = {
        id: null,
        nombre: '',
        descripcion: '',
        duracion_semanas: 0,
        entrenador: null,
        usuario: null,
        semanas: [],
      };
      this.esEdicionEntrenamiento = false;
    }

    this.dialogFormularioEntrenamiento = true;
  }

  actualizarSugerencias(ejercicio: any, diaIndex: number) {
    const dia = this.diasSemana[diaIndex];
    if (ejercicio.dias[diaIndex]) {
      if (!ejercicio.sugerencias) ejercicio.sugerencias = {};
      if (!ejercicio.sugerencias[dia]) {
        ejercicio.sugerencias[dia] = ["(pendiente sugerencia IA)"];
      }
    } else {
      if (ejercicio.sugerencias && ejercicio.sugerencias[dia]) {
        delete ejercicio.sugerencias[dia];
      }
    }
  }

  generarSugerencia(tipo: string, dia: string): string[] {
    // Simula generación de sugerencias, reemplaza con llamada real si lo deseas
    return [`Sugerencia para ${tipo} el ${dia}`];
  }

  guardarAlimentacion() {
    if (this.esEdicionAlimentacion) {
      this.formAlimentacion.usuario = this.selectedTrainer?.userId?.id;
      this.entrenadorService.updateAlimentacion(this.formAlimentacion.id, this.formAlimentacion).subscribe(
        (data) => {
          const index = this.alimentaciones.findIndex(a => a.id === this.formAlimentacion.id);
          if (index !== -1) {
            this.alimentaciones[index] = data;
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alimentación actualizada' });
          this.dialogFormularioAlimentacion = false;
        },
        (error) => console.error(error)
      );
    } else {
      this.formAlimentacion.usuario = this.selectedTrainer?.userId?.id;
      this.entrenadorService.createAlimentacion(this.formAlimentacion).subscribe(
        (data) => {
          this.alimentaciones.push(data);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alimentación añadida' });
          this.dialogFormularioAlimentacion = false;
        },
        (error) => console.error(error)
      );
    }
    this.verAlimentacion(this.selectedTrainer)
  }

  guardarEntrenamiento(): void {
    this.formEntrenamiento.usuario = this.selectedTrainer?.userId?.id;

    if (!this.formEntrenamiento.usuario || !this.formEntrenamiento.nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe completar todos los campos obligatorios.'
      });
      return;
    }

    this.cargandoEntrenamiento = true;

    const finalizar = () => {
      this.cargandoEntrenamiento = false;
      this.dialogFormularioEntrenamiento = false;
      this.verEntrenamiento(this.selectedTrainer);
    };

    if (this.esEdicionEntrenamiento && this.formEntrenamiento.id !== null) {
      this.entrenadorService.updateEntrenamiento(this.formEntrenamiento.id, this.formEntrenamiento).subscribe(
        (data) => {
          const index = this.entrenamientos.findIndex(e => e.id === data.id);
          if (index !== -1) {
            this.entrenamientos[index] = data;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Entrenamiento actualizado'
          });
          finalizar();
        },
        (error) => {
          console.error(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el entrenamiento'
          });
          this.cargandoEntrenamiento = false;
        }
      );
    } else {
      this.entrenadorService.createEntrenamiento(this.formEntrenamiento).subscribe(
        (data) => {
          this.entrenamientos.push(data);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Entrenamiento creado'
          });

          this.formEntrenamiento = {
            id: null,
            usuario: null,
            nombre: '',
            duracion_semanas: 1,
            entrenador: null,
            descripcion: '',
            semanas: []
          };

          finalizar();
        },
        (error) => {
          console.error(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el entrenamiento'
          });
          this.cargandoEntrenamiento = false;
        }
      );
    }
  }


  eliminarAlimentacion(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar esta alimentación?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.entrenadorService.deleteAlimentacion(id).subscribe(
          () => {
            this.alimentaciones = this.alimentaciones.filter(a => a.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alimentación eliminada' });
          },
          (error) => console.error(error)
        );
      }
    });
  }

  eliminarEntrenamiento(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar este entrenamiento?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.entrenadorService.deleteEntrenamiento(id).subscribe(
          () => {
            this.entrenamientos = this.entrenamientos.filter(a => a.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entrenamiento eliminado' });
          },
          (error) => console.error(error)
        );
      }
    });
  }

  verEntrenamiento(trainer: any) {
    this.selectedTrainer = trainer;
    this.entrenadorService.getEntrenamientosPorUsuario(trainer.userId.id).subscribe(
      (data) => {
        this.entrenamientos = data;
        this.entrenamientos.forEach((entrenamiento: any) => {
          if (entrenamiento.entrenador) {
            this.getNombre(entrenamiento.entrenador).subscribe((persona: any) => {
              if (persona.length > 0) {
                entrenamiento.entrenador = `${persona[0].nombres} ${persona[0].apellidos}`;
              } else {
                entrenamiento.entrenador = "Desconocido"; // Si no hay datos
              }
            });
          }
          if (entrenamiento.usuario) {
            this.getNombre(entrenamiento.usuario).subscribe((persona: any) => {
              if (persona.length > 0) {
                entrenamiento.usuario = `${persona[0].nombres} ${persona[0].apellidos}`;
              } else {
                entrenamiento.usuario = "Desconocido"; // Si no hay datos
              }
            });
          }
        });
      },
      (error) => console.error(error)
    );
    this.dialogEntrenamiento = true;
  }

  agregarEntrenamiento() {
    if (this.selectedTrainer) {
      this.formData.usuario = this.selectedTrainer.userId.id;
      this.entrenadorService.createEntrenamiento(this.formData).subscribe(
        (data) => {
          this.entrenamientos.push(data);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entrenamiento añadido' });
        },
        (error) => console.error(error)
      );
    }
  }

  filterCards(): void {
    const search = this.searchValue.toLowerCase();
    this.filteredTrainers = this.trainers.filter(trainer =>
      trainer.userId.first_name.toLowerCase().includes(search) ||
      trainer.userId.last_name.toLowerCase().includes(search) ||
      trainer.userId.email.toLowerCase().includes(search) ||
      trainer.userId.username.toLowerCase().includes(search)
    );
  }

  filterByRole(role: string): void {
    if (role === 'Todos' || !role) {
      this.filteredTrainers = this.trainers;
    } else {
      this.filteredTrainers = this.trainers.filter(trainer => trainer.rolesId.name === role);
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  abrirMedicion() {
    this.esEdicion = true;
    this.formData = {};
    this.dialogMedicion = true;
  }

  cerrarAliemtancion() {
    this.dialogAlimentacion = false
  }

  cerrarVerAliemtancion() {
    this.dialogVerAlimentacion = false
  }

  cerrarVerEntrenamiento() {
    this.dialogVerEntrenamiento = false
  }

  cerrarEntrenamiento() {
    this.dialogEntrenamiento = false
  }

  verPerfil(trainer: any) {
    this.selectedTrainer = trainer;

    this.medicionService.obtenerMedicionesPorUsuario(trainer.userId.id).subscribe(
      (mediciones) => {
        this.medicionesUsuario = mediciones;
      },
      (error) => {
        console.error('Error al obtener mediciones:', error);
      }
    );

    this.dialogMediciones = true;
  }

  cerrarMedicion() {
    this.dialogMedicion = false;
  }

  cerrarDialogo() {
    this.dialogMediciones = false;
    this.dialogAlimentacion = false;
    this.dialogFormularioAlimentacion = false;
  }

  cerrarDialogoAlimentacion() {
    this.dialogFormularioAlimentacion = false;
  }

  cerrarDialogoEntrenamiento() {
    this.dialogFormularioEntrenamiento = false;
  }

  guardarPerfil() {
    this.selectedTrainer = null;
  }

  guardarMedicion() {
    if (this.formData) {
      if (this.formData.id) {
        this.medicionService.actualizarMedicion(this.formData.id, this.formData).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medición actualizada' });
          if (this.selectedTrainer) {
            this.verPerfil(this.selectedTrainer);
          }
          this.dialogMedicion = false;
        });
      } else {
        this.formData.usuario = this.selectedTrainer?.userId?.id;
        this.medicionService.crearMedicion(this.formData).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medición creada' });
          if (this.selectedTrainer) {
            this.verPerfil(this.selectedTrainer);
          }
          this.dialogMedicion = false;
        });
      }
    } else {
      console.log("ERRRROR EN EL FORM")
    }
  }

  getProfileImage(user: any): string {
    if (user && user.avatar) {
      return `${this.base_user}${user.id}/descargar/`;
    }
    return 'assets/avatars/user.png';
  }

  getMediciones() {
    this.medicionService.obtenerMediciones().subscribe(
      (response: any) => {
        this.mediciones = response;
      }
    )
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

  cargarPersonas() {
    this.usuariosService.getAllUsuarios().subscribe(
      (response: Person[]) => {
        this.personas = response.map(persona => ({ ...persona, seleccionado: true }));
      },
      (error: any) => console.error(error)
    );
  }

  seleccionarTodos(event: any) {
    const seleccionado = event.target.checked;
    this.personasFiltradas.forEach(persona => persona.seleccionado = seleccionado);
  }

  filtrarPorCiudad(ciudad: any) {
    this.personasFiltradas = ciudad ?
      this.personas.filter(persona => persona.ciudad_residencia === ciudad) :
      [...this.personas];
  }


  verEntrenamientosMasivos() {
    this.dialogEntrenamientoRegion = true;
    this.cargarPersonas();
  }

  verAlimentacionesMasivas() {
    this.dialogAlimentacionRegion = true;
    this.cargarPersonas();
  }

  cerrarEntrenamientosMasivos() {
    this.dialogEntrenamientoRegion = false;
  }

  cerrarAlimentacionesMasivas() {
    this.dialogAlimentacionRegion = false;
  }

  guardarAlimentacionRegion() {

  }

  guardarEntrenamientoRegion() {

  }

  hasEjerciciosParaDia(dia: string): boolean {
    if (!this.selectedEntrenamiento?.semanas) 
      return false;
    const diaIndex = this.diasSemana.indexOf(dia); 
    return this.selectedEntrenamiento.semanas.some(
      (semana: any) => semana.ejercicios.some(
        (ejercicio: any) => ejercicio.dias[diaIndex]));
  }
}

interface Ejercicio {
  tipo: string;
  dias: boolean[];
  sugerencias?: { [key: string]: string[] };
}