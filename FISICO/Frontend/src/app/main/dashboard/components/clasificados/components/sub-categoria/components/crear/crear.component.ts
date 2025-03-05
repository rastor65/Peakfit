import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ClasificadosService } from 'src/app/core/services/dashboard/clasificados.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.css']
})
export class CrearComponent implements OnInit {


  API_URI = environment.API_URI;
  public token: any;
  public categorias: any[] = [];
  public subCategorias: any[] = [];
  public form = this.fb.group({
    name: ['', Validators.required],
    categoryId: ['', Validators.required]
  })

  constructor(
    private clasificadosService: ClasificadosService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.traerCategorias();
    this.traerSubCategorias();
  }

  onSubmit() {
    if (this.subCategorias.includes(this.form.value.name.trim().toLowerCase())) {
      return this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Esta categoria ya existe' })
    }
    let body = {
      name: this.form.value.name,
      categoryId: this.form.value.categoryId.id
    }

    try {
      this.clasificadosService.create(`${this.API_URI}/advertisements/sub/category/create/`, body , this.token).subscribe(r => {
        this.form.reset();
        console.log(r)
        return this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Creado correctamente !!' })
      })
    } catch (error) {
      console.log(error)
      return this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema en la peticion' })
    }
  }

  traerCategorias() {
    this.categorias = [];
    try {
      this.clasificadosService.getAll(`${this.API_URI}/advertisements/category/`, this.token).subscribe(r => this.categorias = r.data.results);
    } catch (error) {
      console.log(error)
    }
  }

  traerSubCategorias() {
    this.subCategorias = [];
    try {
      this.clasificadosService.getAll(`${this.API_URI}/advertisements/sub/category/`, this.token).subscribe(r => {
        r.data.results.map((seccion: any) => this.subCategorias.push(seccion.name.trim().toLowerCase()))
      });
    } catch (error) {
      console.log(error)
    }
  }

}
