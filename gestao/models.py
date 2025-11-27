from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    job_title = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="users/", null=True, blank=True)

    def __str__(self):
        return self.user.username


class Project(models.Model):
    class TypeProject(models.TextChoices):
        CORPORATIVO = "CORP", ("Corporativo")
        DEPARTAMENTAL = "DEP", ("Departamental")

    class StatusProject(models.TextChoices):
        PLANEJAMENTO = "PLAN", "A Iniciar"
        ATIVO = "ACTIVE", "Em Andamento"
        CONCLUIDO = "CONC", "Concluído"
        CANCELADO = "CANC", "Cancelado"

    crate_date = models.DateTimeField()
    pmo = models.ForeignKey(User, on_delete=models.PROTECT, related_name="project_pmo")
    name = models.CharField(max_length=250)
    objective = models.TextField()
    justification = models.TextField()
    scope = models.TextField()
    results = models.TextField()
    area = models.ForeignKey("Area", on_delete=models.PROTECT, related_name="projects")
    category = models.ForeignKey(
        "Category", on_delete=models.PROTECT, related_name="projects"
    )
    leader = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="project_leader"
    )
    project_type = models.CharField(
        max_length=4,
        choices=TypeProject.choices,
        default=TypeProject.CORPORATIVO,
        db_index=True,
    )
    project_status = models.CharField(
        max_length=5,
        choices=StatusProject.choices,
        default=StatusProject.PLANEJAMENTO,
        db_index=True,
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    percentage_plan = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    percentage_real = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    cancel_justification = models.TextField()
    members = models.ManyToManyField(User, through="ProjectMembers")

    def __str__(self):
        return self.name


class Area(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class ProjectMembers(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey("Project", on_delete=models.CASCADE)
    function = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.function})"


class Canvas(models.Model):
    create_date = models.DateTimeField()
    project = models.ForeignKey("Project", on_delete=models.CASCADE)
    benefits = models.TextField()
    product = models.TextField()
    requirements = models.TextField()
    stakeholders = models.TextField()
    team = models.TextField()
    systems = models.TextChoices()
    assumptions = models.TextField()
    deliverables = models.TextField()
    constraints = models.TextField()
    risks = models.TextField()
    timeline = models.TextField()
    costs = models.TextField()

    def __str__(self):
        return f"Canvas: {self.project.name}"


class Comunication(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "EMAIL", "E-mail"
        TEAMS = "TEAMS", "Teams"
        WHATSAPP = "WHATS", "WhatsApp"
        PHONE = "PHONE", "Telefone"
        MEETING = "MEET", "Reunião Presencial"
        ONLINE_MEETING = "OL_MEET", "Reunião Online"

    class Frequency(models.TextChoices):
        ONCE = "ONCE", "Uma única vez"
        DAILY = "DAILY", "Diária"
        WEEKLY = "WEEKLY", "Semanal"
        MONTHLY = "MONTHLY", "Mensal"
        AFTER_MEETING = "MEETING", "Após cada reunião"
        AS_NEEDED = "NEEDED", "Conforme Necessário"

    create_date = models.DateTimeField()
    project = models.ForeignKey("Project", on_delete=models.CASCADE)
    description = models.TextField()
    objective = models.TextField()
    sender = models.TextField()
    recipient = models.TextField()
    channel = models.CharField(
        max_length=10, choices=Channel.choices, default=Channel.EMAIL
    )
    frequency = models.CharField(
        max_length=7, choices=Frequency.choices, default=Frequency.ONCE
    )

    def __str__(self):
        return (
            f"[{self.project.name}] {self.description} - {self.get_channel_display()}"
        )


class Risks(models.Model):
    class CategoryRisk(models.TextChoices):
        TECNICO = "TEC", "Técnico"
        EXTERNO = "EXT", "Externo"
        ORGANIZACIONAL = "ORG", "Organizacional"
        GESTAO = "GP", "Gestão de Projetos"
        LOGICO = "LOG", "Lógico"
        FISICO = "FIS", "Físico"
        COMPORTAMENTO = "HUM", "Comportamento Humano"
        CONTINUIDADE = "CON", "Continuidade"

    class Score(models.TextChoices):
        MUITO_BAIXO = "0.10", "Muito Baixo"
        BAIXO = "0.30", "Baixo"
        MEDIO = "0.50", "Médio"
        ALTO = "0.70", "Alto"
        MUITO_ALTO = "0.90", "Muito Alto"

    class ActionRisk(models.TextChoices):
        ACEITAR = "ACEITAR", "Aceitar"
        TRANSFERIR = "TRANSFERIR", "Transferir"
        MITIGAR = "MITIGAR", "Mitigar"
        ELIMINAR = "ELIMINAR", "Eliminar"

    class StatusRisk(models.TextChoices):
        INICIAR = "INICIAR", "A Iniciar"
        ANDAMENTO = "ANDAMENTO", "Em Andamento"
        CONCLUIDO = "CONCLUIDO", "Concluído"

    create_date = models.DateTimeField()
    project = models.ForeignKey("Project", on_delete=models.CASCADE)
    description = models.TextField()
    category = models.CharField(max_length=3, choices=CategoryRisk.choices)
    cost = models.DecimalField(max_digits=3, decimal_places=2, choices=Score.choices)
    timeline = models.DecimalField(
        max_digits=3, decimal_places=2, choices=Score.choices
    )
    scope = models.DecimalField(max_digits=3, decimal_places=2, choices=Score.choices)
    quality = models.DecimalField(max_digits=3, decimal_places=2, choices=Score.choices)
    probability = models.DecimalField(
        max_digits=3, decimal_places=2, choices=Score.choices
    )
    action_plan = models.TextField()
    action = models.CharField(
        max_length=10, choices=ActionRisk.choices, default=ActionRisk.MITIGAR
    )
    responsavel = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(
        max_length=9, choices=StatusRisk.choices, default=StatusRisk.INICIAR
    )

    def save(self, *args, **kwargs):
        impact = [self.cost, self.timeline, self.scope, self.quality]

        max_impact = max(impact)
        self.score = max_impact * self.probability
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} (Score: {self.score})"


class Milestones(models.Model):
    create_date = models.DateTimeField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    task = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    taks_percentage_plan = models.DecimalField(max_digits=5, decimal_places=2)
    taks_percentage_real = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Marco {self.task} - Projeto {self.project.name}"
