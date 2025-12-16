from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Projects, Canvas, Risks, ProjectMembers, Areas, Categories


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
        ]


class ProjectMembersSerializer(serializers.ModelSerializer):
    user = UsersSerializer(read_only=True)

    class Meta:
        model = ProjectMembers
        fields = [
            "id",
            "user",
            "function",
        ]


class AreasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Areas
        fields = [
            "id",
            "name",
        ]


class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = [
            "id",
            "name",
        ]


class ProjectsSerializer(serializers.ModelSerializer):
    pmo_first_name = serializers.CharField(source="pmo.first_name", read_only=True)
    pmo_last_name = serializers.CharField(source="pmo.last_name", read_only=True)
    leader_first_name = serializers.CharField(
        source="leader.first_name", read_only=True
    )
    leader_last_name = serializers.CharField(source="leader.last_name", read_only=True)

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
            "pmo_first_name",
            "pmo_last_name",
            "leader",
            "leader_first_name",
            "leader_last_name",
            "area",
            "area_name",
            "category",
            "category_name",
            "percentage_real",
            "start_date",
            "end_date",
            "create_date",
        ]


class CanvasSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Canvas
        fields = [
            "project",
            "project_name",
            "benefits",
            "product",
            "requirements",
            "stakeholders",
            "team",
            "systems",
            "assumptions",
            "deliverables",
            "constraints",
            "risks",
            "timeline",
            "costs",
            "create_date",
        ]


class RisksSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Risks
        fields = [
            "project",
            "project_name",
            "description",
            "category",
            "cost",
            "timeline",
            "scope",
            "quality",
            "probability",
            "score",
            "action_plan",
            "action",
            "responsavel",
            "status",
            "create_date",
        ]

    read_only_fields = ["score"]
