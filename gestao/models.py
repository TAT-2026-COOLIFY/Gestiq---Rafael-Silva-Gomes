import uuid
from datetime import date
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User


class UsersProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    job_title = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="pictures/%Y/%m/", null=True, blank=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "Users Profile"

    def __str__(self):
        return self.user.username


class Areas(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        ordering = ["id"]
        verbose_name = "Area"
        verbose_name_plural = "Areas"

    def __str__(self):
        return self.name


class Categories(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        ordering = ["id"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Projects(models.Model):
    class TypeProject(models.TextChoices):
        CORPORATIVO = "CORP", ("Corporativo")
        DEPARTAMENTAL = "DEP", ("Departamental")
        PESSOAL = "PES", ("Pessoal")
        ACADEMICO = "ACAD", ("Acadêmico")

    class StatusProject(models.TextChoices):
        PLANEJAMENTO = "PLAN", "A Iniciar"
        ATIVO = "ACTIVE", "Em Andamento"
        VALIDACAO = "VALID", "Em Validação"
        MONITORAMENTO = "MONIT", "Em Monitoramento"
        ATRASO = "DELAY", "Em Atraso"
        CONCLUIDO = "CONC", "Concluído"
        CANCELADO = "CANC", "Cancelado"

    create_date = models.DateTimeField(auto_now_add=True)
    po = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="project_po",
        null=True,
        blank=True,
    )
    leader = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="project_leader",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=250)
    area = models.ForeignKey(Areas, on_delete=models.PROTECT, related_name="projects")
    category = models.ForeignKey(
        Categories, on_delete=models.PROTECT, related_name="projects"
    )
    project_type = models.CharField(
        max_length=4,
        choices=TypeProject.choices,
        default=TypeProject.CORPORATIVO,
        db_index=True,
    )
    project_status = models.CharField(
        max_length=10,
        choices=StatusProject.choices,
        default=StatusProject.PLANEJAMENTO,
        db_index=True,
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    @property
    def total_percentage_real(self):
        marcos = self.milestones.all()
        if not marcos.exists():
            return 0

        soma_progresso = sum(marco.percentage_real for marco in marcos)
        return round(soma_progresso / marcos.count(), 2)

    @property
    def total_percentage_plan(self):
        marcos = self.milestones.all()
        if not marcos.exists():
            return 0

        soma_planejado = sum(marco.percentage_plan for marco in marcos)
        return round(soma_planejado / marcos.count(), 2)

    cancel_justification = models.TextField(blank=True)
    members = models.ManyToManyField(User, through="ProjectMembers")

    class Meta:
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self):
        return self.name


class ProjectMembers(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(
        Projects, on_delete=models.CASCADE, related_name="project_members"
    )
    function = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.function})"


class Canvas(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    project = models.OneToOneField(Projects, on_delete=models.CASCADE)
    justification = models.TextField(blank=True)
    objective = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    product = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    stakeholders = models.TextField(blank=True)
    team = models.TextField(blank=True)
    systems = models.TextField(blank=True)
    assumptions = models.TextField(blank=True)
    deliverables = models.TextField(blank=True)
    constraints = models.TextField(blank=True)
    risks = models.TextField(blank=True)
    timeline = models.TextField(blank=True)
    costs = models.TextField(blank=True)

    def __str__(self):
        return f"Canvas: {self.project.name}"


class Communications(models.Model):
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

    create_date = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
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

    class Meta:
        verbose_name = "Communication"
        verbose_name_plural = "Communications"

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

    create_date = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    description = models.TextField()
    category = models.CharField(max_length=3, choices=CategoryRisk.choices)
    cost = models.CharField(max_length=4, choices=Score.choices)
    timeline = models.CharField(max_length=4, choices=Score.choices)
    scope = models.CharField(max_length=4, choices=Score.choices)
    quality = models.CharField(max_length=4, choices=Score.choices)
    probability = models.CharField(max_length=4, choices=Score.choices)
    score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    action_plan = models.TextField(blank=True, null=True)
    action = models.CharField(
        max_length=10, choices=ActionRisk.choices, default=ActionRisk.MITIGAR
    )
    responsavel = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(
        max_length=9, choices=StatusRisk.choices, default=StatusRisk.INICIAR
    )

    def save(self, *args, **kwargs):
        impact = [
            Decimal(self.cost),
            Decimal(self.timeline),
            Decimal(self.scope),
            Decimal(self.quality),
        ]

        max_impact = max(impact)
        self.score = max_impact * Decimal(self.probability)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Risk"
        verbose_name_plural = "Risks"

    def __str__(self):
        return f"{self.description} (Score: {self.score})"


class Activity(models.Model):
    class Status(models.TextChoices):
        PLAN = "PLAN", "A Iniciar"
        DOING = "DOING", "Em Andamento"
        REVIEW = "REVIEW", "Em Validação"
        DONE = "DONE", "Concluído"

    class Priority(models.TextChoices):
        LOW = "LOW", "Baixa"
        MEDIUM = "MEDIUM", "Média"
        HIGH = "HIGH", "Alta"
        CRITICAL = "CRITICAL", "Crítica"

    project = models.ForeignKey(
        Projects, on_delete=models.CASCADE, related_name="activities"
    )

    milestone = models.ForeignKey(
        "Milestones",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activities",
    )

    sprint = models.ForeignKey(
        "Sprints",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activities",
    )

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_activities",
    )

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PLAN
    )
    priority = models.CharField(
        max_length=20, choices=Priority.choices, default=Priority.MEDIUM
    )

    create_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Activity"
        verbose_name_plural = "Activities"
        ordering = ["end_date", "priority"]

    def __str__(self):
        return f"[{self.project.name}] {self.title}"


class Milestones(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(
        Projects, on_delete=models.CASCADE, related_name="milestones"
    )
    task = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

    @property
    def percentage_plan(self):
        hoje = date.today()

        if not self.start_date or not self.end_date:
            return 0

        if hoje < self.start_date:
            return 0

        if hoje > self.end_date:
            return 100

        total_dias = (self.end_date - self.start_date).days
        dias_passados = (hoje - self.start_date).days
        return round((dias_passados / total_dias) * 100, 2)

    @property
    def percentage_real(self):
        total_tasks = self.activities.count()
        if total_tasks == 0:
            return 0
        concluidas = self.activities.filter(status="DONE").count()
        return round((concluidas / total_tasks) * 100, 2)

    def __str__(self):
        return f"Marco: {self.task} ({self.progress}%)"

    class Meta:
        verbose_name = "Milestone"
        verbose_name_plural = "Milestones"

    def __str__(self):
        return f"Marco {self.task} - Projeto {self.project.name}"


class Sprints(models.Model):
    STATUS_CHOICES = [
        ('PLANNED', 'Planejada'),
        ('ACTIVE', 'Ativa'),
        ('FINISHED', 'Finalizada'),
    ]

    project = models.ForeignKey(
        Projects, on_delete=models.CASCADE, related_name="sprints"
    )
    name = models.CharField(max_length=100)
    goal = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='PLANNED'
    )

    class Meta:
        verbose_name = "Sprint"
        verbose_name_plural = "Sprints"
        ordering = ['start_date']

    def __str__(self):
        return f"{self.name} ({self.get_status_display()}) - {self.project.name}"