from rest_framework import viewsets
from .models import Projects, ProjectMembers
from .serializers import ProjectsSerializer, ProjectMembersSerializer

class ProjectsViewSet(viewsets.ModelViewSet):
    queryset = Projects.objects.all().order_by('-create_date')
    serializer_class = ProjectsSerializer
    
class ProjectMembersViewSet(viewsets.ModelViewSet):
    queryset = ProjectMembers.objects.all()
    serializer_class = ProjectMembersSerializer