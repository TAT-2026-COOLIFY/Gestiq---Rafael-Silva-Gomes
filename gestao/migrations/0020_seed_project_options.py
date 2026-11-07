from django.db import migrations


def seed_project_options(apps, schema_editor):
    Areas = apps.get_model("gestao", "Areas")
    Categories = apps.get_model("gestao", "Categories")

    for name in ("TI", "Tecnologia da Informação"):
        Areas.objects.get_or_create(name=name)

    for name in ("Automação", "Desenvolvimento de Software"):
        Categories.objects.get_or_create(name=name)


class Migration(migrations.Migration):
    dependencies = [
        ("gestao", "0019_projectmembers_unique_user_per_project"),
    ]

    operations = [
        migrations.RunPython(seed_project_options, migrations.RunPython.noop),
    ]
