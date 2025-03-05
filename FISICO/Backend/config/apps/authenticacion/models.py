from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import UserManager


def path_to_avatar(instance, filename):              
    return f'avatars/{instance.id}/{filename}'

class CustomUser(AbstractUser):
    username = models.CharField(max_length=45, null=False, unique=True)
    email = models.EmailField("email address", blank=False, null=False, unique=True)
    password = models.CharField(max_length=100)
    resetToken = models.CharField(max_length=256, blank=True, null=True)
    avatar = models.ImageField(upload_to=path_to_avatar, blank=True, null=True)
    roles = models.ManyToManyField('Rol', through='UserRol', related_name='users_customuser')
    codigo = models.CharField(max_length=20, default="SIN_CODIGO")
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class BaseModel(models.Model):
    createdAt = models.DateField(auto_now_add=True)
    updateAt = models.DateField(auto_now=True)
    status = models.BooleanField(default=True)

    class Meta:
        abstract = True

class categoriaTipo(BaseModel):
    nombre = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name = "Categoría de Tipo"
        verbose_name_plural = "Categorías de Tipos"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre

class tablaMaestra(BaseModel):
    categoria = models.ForeignKey(categoriaTipo, on_delete=models.CASCADE, related_name="tipos")
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=10, unique=True, blank=True, null=True)

    class Meta:
        verbose_name = "Tabla Tipo"
        verbose_name_plural = "Tablas Tipo"
        ordering = ["categoria", "nombre"]
    
    def __str__(self):
        return f"{self.categoria} - {self.nombre}"

class Rol(BaseModel):
    name = models.CharField(max_length=200, unique=True)
    status = models.BooleanField(default=True)
    users = models.ManyToManyField(CustomUser, through='UserRol', related_name='roles_rol')
    resources = models.ManyToManyField('Resource', through='ResourceRol', related_name='roles_resource')

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

class Person(BaseModel):
    identificacion = models.CharField(max_length=255, unique=True, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    telefono = models.BigIntegerField(null=True)
    status = models.BooleanField(default=True)
    user = models.OneToOneField(CustomUser, related_name='person',on_delete=models.CASCADE)
    
    document_type = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="documentos", null=True, blank=False)
    nivelFormacion = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="niveles_formacion", null=True, blank=False)
    estado_civil = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="estados_civiles", null=True, blank=False)
    grupoEtnico = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="grupos_etnicos", null=True, blank=False)
    departamento = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="departamento", null=True, blank=False)
    ciudad_residencia = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="ciudad_residencia", null=True, blank=False)
    ciudad_nacimiento = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="ciudad_nacimiento", null=True, blank=False)
    barrio = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="barrio", null=True, blank=False)
    situacion_laboral = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="situacion_laboral", null=True, blank=False)
    estrato = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="estrato", null=True, blank=False)
    genero = models.ForeignKey(tablaMaestra, on_delete=models.SET_NULL, related_name="genero", null=True, blank=False)

    @property
    def nombres(self):
        return self.user.first_name if self.user else ""

    @property
    def apellidos(self):
        return self.user.last_name if self.user else ""

    def __str__(self) -> str:
        return f"{self.nombres} {self.apellidos} ({self.identificacion})"

    class Meta:
        unique_together = (('user', 'identificacion'))
        verbose_name = 'Persona'
        verbose_name_plural = 'Personas'

class UserRol(models.Model):
    status = models.BooleanField(default=True)
    userId = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_roles')
    rolesId = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='role_users')

    def __str__(self):
        return f"{self.userId.username} - {self.rolesId.name}"

    class Meta:
        unique_together = (('userId', 'rolesId'))
        verbose_name = 'User_rols'
        verbose_name_plural = 'user_rols'

class Resource(BaseModel):
    path = models.CharField(max_length=256)
    id_padre = models.IntegerField()
    method = models.CharField(max_length=256)
    icono = models.CharField(max_length=256)
    link = models.CharField(max_length=256)
    titulo = models.CharField(max_length=100)
    roles = models.ManyToManyField(Rol, through='ResourceRol', related_name='resources_rol')
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.titulo} - {', '.join([r.name for r in self.roles.all()])}"
    
    class Meta:
        verbose_name = 'Resources'
        verbose_name_plural = 'Resources'

class ResourceRol(BaseModel):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='resources')
    role = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='resources_rols')
    status = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.resource.titulo + ' - ' + self.role.name

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['resource', 'role'], name='unique_resource_role')
        ]

class Medicion(BaseModel):
    Fecha = models.DateField(auto_now_add=True)  # Asigna la fecha automáticamente
    talla = models.FloatField()
    peso = models.FloatField()
    perimetro_cintura = models.FloatField(null=True)
    perimetro_cadera = models.FloatField(null=True)
    pliegue_pectoral = models.FloatField(null=True, blank=True)
    pliegue_abdominal = models.FloatField(null=True, blank=True)
    pliegue_antemuslo = models.FloatField(null=True, blank=True)
    pliegue_tricipal = models.FloatField(null=True, blank=True)
    pliegue_iliocrestal = models.FloatField(null=True, blank=True)
    fuerza_manoderecha = models.FloatField(null=True)
    fuerza_manoizquierda = models.FloatField(null=True)
    equilibrio = models.FloatField(null=True, blank=True)
    resistencia_abdominal = models.FloatField(null=True, blank=True)
    fuerza_explosiva_i = models.FloatField(null=True, blank=True)
    fuerza_explosiva_f = models.FloatField(null=True, blank=True)
    resistencia_cardiorespiratoria = models.FloatField(null=True, blank=True)
    tiempo_resistencia_cardiorespiratoria = models.FloatField(null=True, blank=True)
    frecuencia_cardiaca = models.FloatField(null=True, blank=True)
    volumen_max_oxigeno = models.FloatField(null=True, blank=True)
    flexibilidad = models.FloatField(null=True, blank=True)
    caff = models.FloatField(null=True, blank=True)
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="mediciones")

class Entrenamiento(BaseModel):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="entrenamientos")
    entrenador = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="entrenamientos_asignados")
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    duracion_semanas = models.IntegerField()
    
    def __str__(self):
        return f"{self.nombre} - {self.usuario.username} (Entrenador: {self.entrenador.username})"

    class Meta:
        verbose_name = "Entrenamiento"
        verbose_name_plural = "Entrenamientos"

class Alimentacion(BaseModel):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="alimentaciones")
    entrenador = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="alimentaciones_asignadas")
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    calorias_diarias = models.IntegerField()
    
    def __str__(self):
        return f"{self.nombre} - {self.usuario.username} (Entrenador: {self.entrenador.username})"

    class Meta:
        verbose_name = "Alimentación"
        verbose_name_plural = "Planes de Alimentación"