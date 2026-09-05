from django.contrib import admin
from .models import (
    UsersProfile,
    Areas,
    Categories,
    Projects,
    ProjectMembers,
    Canvas,
    Communications,
    Risks,
    Milestones,
    Activity,
    Sprints,
)

# -------------------------------------------------------------------------
# INLINES (Isso faz o Canvas e Membros aparecerem DENTRO da tela do Projeto)
# -------------------------------------------------------------------------


class CanvasInline(admin.StackedInline):
    model = Canvas
    extra = 0
    can_delete = False


class ProjectMembersInline(admin.TabularInline):
    model = ProjectMembers
    extra = 1


class MilestonesInline(admin.TabularInline):
    model = Milestones
    extra = 0
    readonly_fields = ("percentage_plan", "percentage_real")


class SprintsInline(admin.TabularInline):
    model = Sprints
    extra = 0


# -------------------------------------------------------------------------
# ADMINS PRINCIPAIS
# -------------------------------------------------------------------------


@admin.register(UsersProfile)
class UsersProfileAdmin(admin.ModelAdmin):

    list_display = ("user", "job_title", "department")
    search_fields = ("user__username", "job_title", "department")


@admin.register(Areas)
class AreasAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(Categories)
class CategoriesAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(Projects)
class ProjectsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "project_type",
        "project_status",
        "project_manager",
        "leader",
        "total_percentage_real",
    )

    list_filter = ("project_status", "project_type", "area", "category")

    # Barra de pesquisa (Busca por nome do projeto ou nome do líder)
    search_fields = ("name", "project_manager__username", "leader__username")

    # Campos que são apenas leitura (automáticos)
    readonly_fields = ("create_date", "total_percentage_real", "total_percentage_plan")

    # Aqui ativamos os Inlines que criamos lá em cima
    inlines = [CanvasInline, ProjectMembersInline, MilestonesInline, SprintsInline]

    # Paginação (se tiver muitos projetos)
    list_per_page = 20

    actions = ["delete_selected"]


admin.site.register(Canvas)


@admin.register(Communications)
class CommunicationsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "short_description",
        "project",
        "channel",
        "frequency",
        "create_date",
    )
    list_filter = ("channel", "frequency", "project")
    search_fields = ("description", "project__name")

    # Truque para não mostrar a descrição inteira na lista se for gigante
    def short_description(self, obj):
        return (
            obj.description[:50] + "..."
            if len(obj.description) > 50
            else obj.description
        )

    short_description.short_description = "Descrição"


@admin.register(Risks)
class RisksAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "description",
        "project",
        "category",
        "probability",
        "score",
        "status",
    )
    list_filter = ("status", "category", "action", "project")
    search_fields = ("description", "project__name")

    # Mostra o score calculado como apenas leitura (já que é automático no save)
    readonly_fields = ("score", "create_date")


@admin.register(Milestones)
class MilestonesAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "task",
        "project",
        "start_date",
        "end_date",
        "percentage_plan",
        "percentage_real",
    )
    list_filter = ("project",)
    search_fields = ("task", "project__name")
    readonly_fields = ("percentage_plan", "percentage_real")


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "project",
        "milestone",
        "sprint",
        "status",
        "priority",
        "assigned_to",
    )
    list_filter = ("status", "priority", "project", "sprint")
    search_fields = ("title", "project__name")
    readonly_fields = ("create_date", "sprint_added_at")


@admin.register(Sprints)
class SprintsAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'project')
    search_fields = ("name", "project__name")
