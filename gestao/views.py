from rest_framework.response import Response
from rest_framework import viewsets, status
from django.contrib.auth.models import User
from .models import (
    Areas,
    Categories,
    Projects,
    Canvas,
    Risks,
    Communications,
    ProjectMembers,
)
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

    def get_queryset(self):
        queryset = ProjectMembers.objects.all()
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def create(self, request, *args, **kwargs):
        project_id = request.data.get("project")
        email_recebido = request.data.get("email")
        function = request.data.get("function", "Colaborador")

        if not email_recebido:
            return Response(
                {"detail": "O e-mail é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_to_add = User.objects.filter(email=email_recebido).first()

        if not user_to_add:
            return Response(
                {"detail": "Usuário não encontrado. Peça para ele se cadastrar."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if ProjectMembers.objects.filter(
            project_id=project_id, user=user_to_add
        ).exists():
            return Response(
                {"detail": "Usuário já está na equipe."},
                status=status.HTTP_409_CONFLICT,
            )

        try:
            member = ProjectMembers.objects.create(
                project_id=project_id, user=user_to_add, function=function
            )
            serializer = self.get_serializer(member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"detail": f"Erro Técnico: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CommunicationViewSet(viewsets.ModelViewSet):
    queryset = Communications.objects.all()
    serializer_class = ProjectMembersSerializer
