from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UsersProfile,
    Projects,
    Canvas,
    Risks,
    ProjectMembers,
    Areas,
    Categories,
    Communications,
    Activity,
    Milestones,
    Sprints,
)


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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
            password=validated_data["password"],     
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="profile.job_title", required=False)
    department = serializers.CharField(source="profile.department", required=False)
    photo = serializers.ImageField(source="profile.photo", required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "job_title",
            "department",
            "photo",
        ]
        read_only_fields = ["username"]

    def update(self, instance, validated_data):

        profile_data = validated_data.pop("profile", {})

        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.email = validated_data.get("email", instance.email)
        instance.save()

        profile, created = UsersProfile.objects.get_or_create(user=instance)

        if "job_title" in profile_data:
            profile.job_title = profile_data["job_title"]

        if "department" in profile_data:
            profile.department = profile_data["department"]

        if "photo" in profile_data:
            profile.photo = profile_data["photo"]

        profile.save()

        return instance


class ProjectMembersSerializer(serializers.ModelSerializer):
    nome_completo = serializers.SerializerMethodField()
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    job_title = serializers.CharField(
        source="user.profile.job_title", read_only=True, default=""
    )
    department = serializers.CharField(
        source="user.profile.department", read_only=True, default=""
    )
    photo = serializers.ImageField(source="user.profile.photo", read_only=True)

    class Meta:
        model = ProjectMembers
        fields = [
            "id",
            "project",
            "user",
            "function",
            "nome_completo",
            "username",
            "email",
            "job_title",
            "department",
            "photo",
        ]

    def get_nome_completo(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username


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
    po_first_name = serializers.CharField(
        source="po.first_name", read_only=True, default=""
    )
    po_last_name = serializers.CharField(
        source="po.last_name", read_only=True, default=""
    )
    leader_first_name = serializers.CharField(
        source="leader.first_name", read_only=True, default=""
    )
    leader_last_name = serializers.CharField(
        source="leader.last_name", read_only=True, default=""
    )

    area_name = serializers.CharField(source="area.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    total_percentage_real = serializers.FloatField(read_only=True)
    total_percentage_plan = serializers.FloatField(read_only=True)

    class Meta:
        model = Projects
        fields = [
            "id",
            "name",
            "project_type",
            "project_status",
            "po",
            "po_first_name",
            "po_last_name",
            "leader",
            "leader_first_name",
            "leader_last_name",
            "area",
            "area_name",
            "category",
            "category_name",
            "total_percentage_real",
            "total_percentage_plan",
            "start_date",
            "end_date",
            "create_date",
        ]


class CanvasSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Canvas
        fields = [
            "id",
            "project",
            "project_name",
            "justification",
            "objective",
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
            "id",
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


class CommunicationsSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Communications
        fields = [
            "id",
            "create_date",
            "project",
            "project_name",
            "description",
            "objective",
            "sender",
            "recipient",
            "channel",
            "frequency",
        ]


class ActivitiesSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(
        source="assigned_to.username", read_only=True
    )
    assigned_to_first_name = serializers.CharField(
        source="assigned_to.first_name", read_only=True, default=""
    )
    assigned_to_photo = serializers.SerializerMethodField()
    milestone_name = serializers.CharField(
        source="milestone.task", read_only=True, default=""
    )
    sprint_name = serializers.CharField(
        source="sprint.name", read_only=True, default=""
    )

    class Meta:
        model = Activity
        fields = [
            "id",
            "project",
            "title",
            "description",
            "start_date",
            "end_date",
            "assigned_to",
            "assigned_to_username",
            "assigned_to_first_name",
            "assigned_to_photo",
            "status",
            "type",
            "story_points",
            "priority",
            "create_date",
            "milestone",
            "milestone_name",
            "sprint",
            "sprint_name",
        ]

    def get_assigned_to_photo(self, obj):
        if (
            obj.assigned_to
            and hasattr(obj.assigned_to, "profile")
            and obj.assigned_to.profile.photo
        ):
            try:
                request = self.context.get('request')
                photo_url = obj.assigned_to.profile.photo.url
                if request is not None:
                    return request.build_absolute_uri(photo_url)
                return photo_url
            except Exception:
                return None
        return None


class MilestonesSerializer(serializers.ModelSerializer):
    percentage_real = serializers.FloatField(read_only=True)
    percentage_plan = serializers.FloatField(read_only=True)
    activities_count = serializers.IntegerField(
        source="activities.count", read_only=True
    )

    class Meta:
        model = Milestones
        fields = [
            "id",
            "project",
            "task",
            "start_date",
            "end_date",
            "percentage_plan",
            "percentage_real",
            "activities_count",
        ]


class SprintsSerializer(serializers.ModelSerializer):
    activities_count = serializers.IntegerField(
        source="activities.count", read_only=True
    )

    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )

    class Meta:
        model = Sprints
        fields = [
            "id",
            "project",
            "name",
            "goal",           # <- Adicionado
            "start_date",
            "end_date",
            "status",         # <- Novo campo no lugar do is_active
            "status_display", # <- Bônus
            "activities_count",
        ]
