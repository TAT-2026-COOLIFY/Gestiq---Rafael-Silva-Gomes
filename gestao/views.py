from rest_framework import viewsets
from django.contrib.auth.models import User
from .models import Areas, Categories, Projects, ProjectMembers
from .serializers import (
    UsersSerializer,
    AreasSerializer,
    CategoriesSerializer,
    ProjectsSerializer,
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


class ProjectMembersViewSet(viewsets.ModelViewSet):
    queryset = ProjectMembers.objects.all()
    serializer_class = ProjectMembersSerializer
