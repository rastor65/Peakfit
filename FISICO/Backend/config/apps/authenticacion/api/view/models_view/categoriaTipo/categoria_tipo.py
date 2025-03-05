from rest_framework import viewsets
from apps.authenticacion.models import categoriaTipo
from ....serializer.serializers import categoriaTipoSerializer

class categoriaTipoView(viewsets.ModelViewSet):
    queryset = categoriaTipo.objects.all()
    serializer_class = categoriaTipoSerializer