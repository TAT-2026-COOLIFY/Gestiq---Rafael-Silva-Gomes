from rest_framework import viewsets
from django.contrib.auth.models import User
from .models import Areas, Categories, Projects, Canvas, Risks, ProjectMembers
from .serializers import (
    UsersSerializer,
    AreasSerializer,
    CategoriesSerializer,
    ProjectsSerializer,
    CanvasSerializer,
    RisksSerializer,
    ProjectMembersSerializer,
)


class UsersViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsersSerializer


class AreasViewSet(viewsets.ModelViewSet):
    queryset = Areas.objects.all()
    serializer_class = AreasSerializer


class CategoriesViewSet(viewsets.ModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer


class ProjectsViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all().order_by("-create_date")
    serializer_class = ProjectsSerializer


class CanvasViewSet(viewsets.ModelViewSet):
    queryset = Canvas.objects.all()
    serializer_class = CanvasSerializer

    def get_queryset(self):
        queryset = Canvas.objects.all()
        project_id = self.request.query_params.get("project")

        if project_id:
            queryset = queryset.filter(project_id=project_id)
            print(f"Itens encontrados: {queryset.count()}")

        return queryset


class RisksViewSet(viewsets.ModelViewSet):
    queryset = Risks.objects.all()
    serializer_class = RisksSerializer

    def get_queryset(self):
        queryset = Risks.objects.all()
        project_id = self.request.query_params.get("project")

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class ProjectMembersViewSet(viewsets.ModelViewSet):
    queryset = ProjectMembers.objects.all()
    serializer_class = ProjectMembersSerializer
