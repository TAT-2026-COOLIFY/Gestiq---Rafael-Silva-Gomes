from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Projects, ProjectMembers, Areas, Categories


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email",]


class ProjectMembersSerializer(serializers.ModelSerializer):
    user = UsersSerializer(read_only=True)

    class Meta:
        model = ProjectMembers
        fields = ["id", "user", "function",]


class AreasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Areas
        fields = ["id", "name",]


class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ["id", "name",]


class ProjectsSerializer(serializers.ModelSerializer):
    pmo_username = serializers.CharField(source="pmo.username", read_only=True)
    leader_username = serializers.CharField(source="leader.username", read_only=True)

    area_name = serializers.CharField(source="area.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Projects
        fields = [
            "id",
            "name",
            "project_type",
            "project_status",
            "pmo",
            "pmo_username",
            "leader",
            "leader_username",
            "area",
            "area_name",
            "category",
            "category_name",
            "percentage_real",
            "start_date",
            "end_date",
            "create_date",
        ]
