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
    StatusReport
)

# -------------------------------------------------------------------------
# INLINES (Isso faz o Canvas e Membros aparecerem DENTRO da tela do Projeto)
# -------------------------------------------------------------------------


class CanvasInline(admin.StackedInline):
    model = Canvas
    extra = 0  # Não mostra formulários vazios extras
    can_delete = False  # Evita deletar o canvas sem querer


class ProjectMembersInline(admin.TabularInline):
    model = ProjectMembers
    extra = 1  # Mostra 1 linha vazia para adicionar novo membro


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
    # Colunas que aparecem na lista
    list_display = (
        "id",
        "name",
        "project_type",
        "project_status",
        "pmo",
        "leader",
        "percentage_real",
    )

    # Filtros na barra lateral direita (CRUCIAL para gestão)
    list_filter = ("project_status", "project_type", "area", "category")

    # Barra de pesquisa (Busca por nome do projeto ou nome do líder)
    search_fields = ("name", "pmo__username", "leader__username")

    # Campos que são apenas leitura (automáticos)
    readonly_fields = ("create_date",)

    # Aqui ativamos os Inlines que criamos lá em cima
    inlines = [CanvasInline, ProjectMembersInline]

    # Paginação (se tiver muitos projetos)
    list_per_page = 20

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
        "task_percentage_real",
    )
    list_filter = ("project",)
    search_fields = ("task", "project__name")

@admin.register(StatusReport)
class StatusReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project",
        "previous_status",
        "current_status",
        "trend",
        "trend_description",
        "ongoing_activities",
        "next_activities",
        "pending_activities",
        "attention_points",
        "observations",
    )
    list_filter = ("project",)
