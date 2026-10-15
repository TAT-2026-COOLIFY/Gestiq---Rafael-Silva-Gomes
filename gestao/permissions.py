from django.db.models import Q
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Projects


def accessible_projects(user):
    if not user or not user.is_authenticated:
        return Projects.objects.none()
    if user.is_superuser:
        return Projects.objects.all()
    return Projects.objects.filter(
        Q(project_manager=user) | Q(leader=user) | Q(project_members__user=user)
    ).distinct()


def user_has_project_role(user, project, roles, allow_canceled=False):
    if user.is_superuser:
        return True
    if not project or (
        not allow_canceled
        and project.project_status == Projects.StatusProject.CANCELADO
    ):
        return False
    if "manager" in roles and project.project_manager_id == user.id:
        return True
    if "leader" in roles and project.leader_id == user.id:
        return True
    if "member" in roles and project.project_members.filter(user=user).exists():
        return True
    return False


class ProjectObjectPermission(BasePermission):

    message = "Você não tem permissão para realizar esta ação neste projeto."

    def _project_from_request(self, request):
        id_projeto = request.data.get("project")
        if not id_projeto:
            return None
        return accessible_projects(request.user).filter(pk=id_projeto).first()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or request.user.is_superuser:
            return True

        funcoes_permitidas = getattr(view, "write_roles", ())
        if not funcoes_permitidas:
            return False

        if getattr(view, "permission_resource", None) == "project":
            return request.method == "POST" or request.method in ("PUT", "PATCH", "DELETE")

        projeto = self._project_from_request(request)
        if request.method == "POST":
            return user_has_project_role(
                request.user, projeto, funcoes_permitidas
            )

        if request.data.get("project"):
            return user_has_project_role(
                request.user, projeto, funcoes_permitidas
            )
        return True

    def has_object_permission(self, request, view, obj):
        projeto = obj if isinstance(obj, Projects) else getattr(obj, "project", None)
        if request.method in SAFE_METHODS:
            return accessible_projects(request.user).filter(pk=projeto.pk).exists()

        funcoes_permitidas = getattr(view, "write_roles", ())

        return user_has_project_role(
            request.user,
            projeto,
            funcoes_permitidas,
            allow_canceled=isinstance(obj, Projects),
        )
