from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, ProjectMembers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        
class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectMembers
        fields = ['id', 'user', 'function']
        
class ProjectSerializer(serializers.ModelSerializer):
    pmo_username = serializers.CharField(source='pmo.username', read_only=True)
    leader_username = serializers.CharField(source='leader.username', read_only=True)
    
    area_name = serializers.CharField(source='area.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 
            'name', 
            'project_type', 
            'project_status', 
            'pmo', 
            'pmo_username',
            'leader',
            'leader_username',
            'area',
            'area_name',
            'category',
            'category_name',
            'percentage_real',
            'start_date',
            'end_date',
            'create_date', 
        ]
    