from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db.models import Q
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
    StatusReport,
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
    StatusReportSerializer,
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
            Q(pmo=user) | Q(project_members__user=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(pmo=self.request.user)


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
    serializer_class = CommunicationsSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class ActivitiesViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitiesSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class MilestonesViewSet(viewsets.ModelViewSet):
    queryset = Milestones.objects.all()
    serializer_class = MilestonesSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]


class StatusReportViewSet(viewsets.ModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer

    def get_queryset(self):
        project_id = self.request.query_params.get('project')

        if not project_id:
            return StatusReport.objects.none()
        
        report, _ = StatusReport.objects.get_or_create(
            project_id=project_id,
            defaults={
                'previous_status': 'OK',
                'current_status': 'OK',
                'trend': 'STABLE',
            }
        )

        return StatusReport.objects.filter(project_id=project_id)


