from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("gestao", "0018_project_manager_and_burnup_history"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="projectmembers",
            constraint=models.UniqueConstraint(
                fields=("project", "user"),
                name="unique_user_per_project",
            ),
        ),
    ]
