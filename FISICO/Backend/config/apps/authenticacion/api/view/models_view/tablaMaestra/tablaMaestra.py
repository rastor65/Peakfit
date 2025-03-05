from rest_framework import viewsets
from apps.authenticacion.models import tablaMaestra
from ....serializer.serializers import tablaMaestraSerializer

class tablaMaestraView(viewsets.ModelViewSet):
    queryset = tablaMaestra.objects.all()
    serializer_class = tablaMaestraSerializer