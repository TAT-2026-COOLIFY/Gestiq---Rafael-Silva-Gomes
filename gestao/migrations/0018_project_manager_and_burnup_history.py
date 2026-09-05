from datetime import datetime, time

from django.db import migrations, models
from django.utils import timezone


def populate_existing_data(apps, schema_editor):
    Activity = apps.get_model("gestao", "Activity")
    ProjectMembers = apps.get_model("gestao", "ProjectMembers")

    ProjectMembers.objects.filter(function__iexact="PO").update(
        function="Gestor do Projeto"
    )

    for activity in Activity.objects.select_related("sprint").filter(
        sprint__isnull=False
    ):
        sprint_start = timezone.make_aware(
            datetime.combine(activity.sprint.start_date, time.min)
        )
        activity.sprint_added_at = max(activity.create_date, sprint_start)
        activity.save(update_fields=["sprint_added_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("gestao", "0017_activity_story_points"),
    ]

    operations = [
        migrations.RenameField(
            model_name="projects",
            old_name="po",
            new_name="project_manager",
        ),
        migrations.AlterField(
            model_name="projects",
            name="project_manager",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.PROTECT,
                related_name="managed_projects",
                to="auth.user",
                verbose_name="Gestor do Projeto",
            ),
        ),
        migrations.AddField(
            model_name="activity",
            name="sprint_added_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(populate_existing_data, migrations.RunPython.noop),
    ]
