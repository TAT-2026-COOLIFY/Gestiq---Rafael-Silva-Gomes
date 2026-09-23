from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import (
    Areas,
    Categories,
    Projects,
    Canvas,
    Risks,
    Communications,
    ProjectMembers,
    Activity,
    Milestones,
    Sprints,
)
from .serializers import (
    UsersSerializer,
    RegisterSerializer,
    UserProfileUpdateSerializer,
    AreasSerializer,
    CategoriesSerializer,
    ProjectsSerializer,
    CanvasSerializer,
    RisksSerializer,
    CommunicationsSerializer,
    ProjectMembersSerializer,
    ActivitiesSerializer,
    MilestonesSerializer,
    SprintsSerializer,
)
from .permissions import accessible_projects, ProjectObjectPermission


class UsersViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsersSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class UserMeView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = UserProfileUpdateSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class AreasViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Areas.objects.all()
    serializer_class = AreasSerializer


class CategoriesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer


class ProjectsViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectsSerializer
    permission_classes = [ProjectObjectPermission]
    permission_resource = "project"
    write_roles = ("manager",)

    def get_queryset(self):
        return accessible_projects(self.request.user)

    def perform_create(self, serializer):
        project = serializer.save(project_manager=self.request.user)

        ProjectMembers.objects.create(
            project=project,
            user=self.request.user,
            function="Gestor do Projeto"
        )


class CanvasViewSet(viewsets.ModelViewSet):
    serializer_class = CanvasSerializer
    permission_classes = [ProjectObjectPermission]
    write_roles = ("manager", "leader")

    def get_queryset(self):
        return Canvas.objects.filter(project__in=accessible_projects(self.request.user))

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class RisksViewSet(viewsets.ModelViewSet):
    serializer_class = RisksSerializer
    permission_classes = [ProjectObjectPermission]
    write_roles = ("manager", "leader")

    def get_queryset(self):
        return Risks.objects.filter(project__in=accessible_projects(self.request.user))

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class ProjectMembersViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMembersSerializer
    permission_classes = [ProjectObjectPermission]
    write_roles = ("manager",)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]

    def get_queryset(self):
        return ProjectMembers.objects.filter(
            project__in=accessible_projects(self.request.user)
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        project = instance.project
        user_to_remove = instance.user
        
        if project.project_manager != request.user:
            raise PermissionDenied(
                "Apenas o Gestor do Projeto pode remover membros da equipe."
            )
        
        Activity.objects.filter(project=project, assigned_to=user_to_remove).update(assigned_to=None)
        
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        project_id = request.data.get("project")
        
        if not project_id:
            return Response({"detail": "ID do projeto é obrigatório."}, status=400)

        try:
            project = Projects.objects.get(id=project_id)
        except Projects.DoesNotExist:
            return Response({"detail": "Projeto não encontrado."}, status=404)

        if project.project_manager != request.user:
            return Response(
                {"detail": "Você não tem permissão para adicionar membros a este projeto."},
                status=status.HTTP_403_FORBIDDEN
            )

        email_recebido = request.data.get("email")
        function = request.data.get("function", "Colaborador")

        if not email_recebido:
            return Response({"detail": "O e-mail é obrigatório."}, status=400)

        user_to_add = User.objects.filter(email=email_recebido).first()

        if not user_to_add:
            return Response(
                {"detail": "Usuário não encontrado. Peça para ele se cadastrar."},
                status=404
            )

        if ProjectMembers.objects.filter(project=project, user=user_to_add).exists():
            return Response({"detail": "Usuário já está na equipe."}, status=409)

        try:
            member = ProjectMembers.objects.create(
                project=project, 
                user=user_to_add, 
                function=function
            )
            serializer = self.get_serializer(member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": f"Erro Técnico: {str(e)}"}, status=400)


class CommunicationViewSet(viewsets.ModelViewSet):
    serializer_class = CommunicationsSerializer
    permission_classes = [ProjectObjectPermission]
    write_roles = ("manager", "leader")

    def get_queryset(self):
        return Communications.objects.filter(
            project__in=accessible_projects(self.request.user)
        )

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class ActivitiesViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitiesSerializer
    permission_classes = [ProjectObjectPermission]
    write_roles = ("manager", "leader", "member")

    def get_queryset(self):
        return Activity.objects.filter(project__in=accessible_projects(self.request.user))

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project", "milestone", "sprint", "status", "type", "priority"]

    def perform_destroy(self, instance):
        if instance.sprint and instance.sprint.status == "ACTIVE":
            raise ValidationError(
                {
                    "sprint": (
                        "Não é possível excluir uma atividade de uma sprint "
                        "em andamento."
                    )
                }
            )
        instance.delete()


class MilestonesViewSet(viewsets.ModelViewSet):
    serializer_class = MilestonesSerializer
    permission_classes = [ProjectObjectPermission]
    write_roles = ("manager",)

    def get_queryset(self):
        return Milestones.objects.filter(
            project__in=accessible_projects(self.request.user)
        )

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class SprintsViewSet(viewsets.ModelViewSet):
    serializer_class = SprintsSerializer
    permission_classes = [ProjectObjectPermission]
    write_roles = ("manager",)

    def get_queryset(self):
        return Sprints.objects.filter(project__in=accessible_projects(self.request.user))
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project", "status"]

