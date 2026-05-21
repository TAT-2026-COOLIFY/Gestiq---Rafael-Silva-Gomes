from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.core.mail import send_mail
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
    ProjectInvitation,
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


class UsersViewSet(viewsets.ModelViewSet):
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


class AreasViewSet(viewsets.ModelViewSet):
    queryset = Areas.objects.all()
    serializer_class = AreasSerializer


class CategoriesViewSet(viewsets.ModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer


class ProjectsViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Projects.objects.all()

        return Projects.objects.filter(
            Q(po=user) | Q(leader=user) | Q(project_members__user=user)
        ).distinct()

    def perform_create(self, serializer):
        project = serializer.save(po=self.request.user)

        ProjectMembers.objects.create(
            project=project,
            user=self.request.user,
            function="PO"
        )


class CanvasViewSet(viewsets.ModelViewSet):
    queryset = Canvas.objects.all()
    serializer_class = CanvasSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class RisksViewSet(viewsets.ModelViewSet):
    queryset = Risks.objects.all()
    serializer_class = RisksSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class ProjectMembersViewSet(viewsets.ModelViewSet):
    queryset = ProjectMembers.objects.all()
    serializer_class = ProjectMembersSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        project = instance.project

        if project.po != request.user:
            raise PermissionDenied("Apenas o PMO pode remover membros da equipe.")
        
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        project_id = request.data.get("project")
        
        if not project_id:
            return Response({"detail": "ID do projeto é obrigatório."}, status=400)

        try:
            project = Projects.objects.get(id=project_id)
        except Projects.DoesNotExist:
            return Response({"detail": "Projeto não encontrado."}, status=404)

        if project.po != request.user:
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
    queryset = Communications.objects.all()
    serializer_class = CommunicationsSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class ActivitiesViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitiesSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project", "milestone", "sprint", "status"]


class MilestonesViewSet(viewsets.ModelViewSet):
    queryset = Milestones.objects.all()
    serializer_class = MilestonesSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class SprintsViewSet(viewsets.ModelViewSet):
    queryset = Sprints.objects.all()
    serializer_class = SprintsSerializer
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project", "status"]

class SendInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_id = request.data.get("project")
        email_recebido = request.data.get("email")
        function = request.data.get("function", "Participante")

        if not project_id or not email_recebido:
            return Response({"detail": "Projeto e e-mail são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        project = get_object_or_404(Projects, id=project_id)

        if project.po != request.user:
            return Response(
                {"detail": "Você não tem permissão para enviar convites neste projeto."},
                status=status.HTTP_403_FORBIDDEN
            )

        invitation = ProjectInvitation.objects.create(
            project=project,
            email=email_recebido,
            function=function
        )

        link_aceite = f"http://localhost:5173/convite/{invitation.token}"
        
        assunto = f"Convite para o projeto {project.name}"
        mensagem = (
            f"Olá!\n\nVocê foi convidado pelo {request.user.first_name} para atuar como {function} "
            f"no projeto '{project.name}'.\n\nClique no link abaixo para aceitar:\n{link_aceite}"
        )

        send_mail(
            assunto,
            mensagem,
            'nao-responda@gestiq.com.br',
            [email_recebido],
            fail_silently=False,
        )

        return Response({"detail": "Convite enviado por e-mail com sucesso!"}, status=status.HTTP_201_CREATED)


class AcceptInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, token):
        invitation = get_object_or_404(ProjectInvitation, token=token)

        if invitation.is_accepted:
            return Response({"detail": "Este convite já foi aceito anteriormente."}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.user.email != invitation.email:
            return Response(
                {"detail": "Este convite foi enviado para outro e-mail. Faça login com a conta correta."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if ProjectMembers.objects.filter(project=invitation.project, user=request.user).exists():
            return Response({"detail": "Você já é membro deste projeto."}, status=status.HTTP_400_BAD_REQUEST)

        ProjectMembers.objects.create(
            project=invitation.project,
            user=request.user,
            function=invitation.function
        )

        invitation.is_accepted = True
        invitation.save()

        return Response({"detail": "Convite aceito! Bem-vindo ao projeto.", "project_id": invitation.project.id}, status=status.HTTP_200_OK)
