from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, ProjectMembers

class UserSerializer(serializers.ModelSerializer)
