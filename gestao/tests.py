from datetime import date, datetime, timezone as datetime_timezone
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from .models import Activity, Categories, Projects, Sprints
from .serializers import ActivitiesSerializer, ProjectsSerializer


class ActivityBurnupHistoryTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="gestor")
        self.category = Categories.objects.create(name="Tecnologia")
        self.project = Projects.objects.create(
            name="Projeto",
            category=self.category,
            project_manager=self.user,
        )
        self.sprint = Sprints.objects.create(
            project=self.project,
            name="Sprint 1",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10),
            status="ACTIVE",
        )

    def test_records_when_task_enters_sprint_and_preserves_it_on_status_change(self):
        activity = Activity.objects.create(
            project=self.project,
            sprint=self.sprint,
            title="Tarefa",
            story_points=5,
        )
        added_at = activity.sprint_added_at

        self.assertIsNotNone(added_at)

        activity.status = Activity.Status.DONE
        activity.save()
        activity.refresh_from_db()

        self.assertEqual(activity.sprint_added_at, added_at)
        self.assertEqual(activity.end_date, timezone.localdate())
        self.assertEqual(
            ActivitiesSerializer(activity).data["end_date"],
            timezone.localdate().isoformat(),
        )

    def test_clears_and_recreates_sprint_entry_date_when_task_is_moved(self):
        activity = Activity.objects.create(
            project=self.project,
            sprint=self.sprint,
            title="Tarefa",
        )

        activity.sprint = None
        activity.save()
        self.assertIsNone(activity.sprint_added_at)

        activity.sprint = self.sprint
        activity.save()
        self.assertIsNotNone(activity.sprint_added_at)

    def test_completion_uses_project_local_date_near_utc_midnight(self):
        activity = Activity.objects.create(
            project=self.project,
            sprint=self.sprint,
            title="Tarefa noturna",
        )
        utc_after_midnight = datetime(
            2026, 9, 6, 0, 30, tzinfo=datetime_timezone.utc
        )

        with patch("gestao.models.timezone.now", return_value=utc_after_midnight):
            activity.status = Activity.Status.DONE
            activity.save()

        self.assertEqual(activity.end_date, date(2026, 9, 5))


class ProjectManagerTests(TestCase):
    def test_serializer_exposes_project_manager_role(self):
        manager = User.objects.create_user(username="gestor")
        category = Categories.objects.create(name="Tecnologia")
        project = Projects.objects.create(
            name="Projeto",
            category=category,
            project_manager=manager,
        )

        data = ProjectsSerializer(project).data

        self.assertEqual(data["project_manager"], manager.id)
        self.assertNotIn("po", data)
