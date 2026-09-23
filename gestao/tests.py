from datetime import date, datetime, timezone as datetime_timezone
from unittest.mock import patch

from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    Activity,
    Categories,
    Milestones,
    ProjectMembers,
    Projects,
    Risks,
    Sprints,
)
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


class ProjectAuthorizationTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(username="manager")
        self.leader = User.objects.create_user(username="leader")
        self.member = User.objects.create_user(username="member")
        self.outsider = User.objects.create_user(username="outsider")
        self.category = Categories.objects.create(name="Tecnologia")
        self.project = Projects.objects.create(
            name="Projeto protegido",
            category=self.category,
            project_manager=self.manager,
            leader=self.leader,
        )
        ProjectMembers.objects.create(
            project=self.project, user=self.member, function="Desenvolvedor"
        )
        self.milestone = Milestones.objects.create(
            project=self.project,
            task="Marco obrigatório",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 30),
        )
        self.activity = Activity.objects.create(
            project=self.project,
            milestone=self.milestone,
            title="Atividade protegida",
        )
        self.risk = Risks.objects.create(
            project=self.project,
            description="Risco protegido",
            category="TEC",
            cost="0.10",
            timeline="0.10",
            scope="0.10",
            quality="0.10",
            probability="0.10",
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_outsider_cannot_read_or_change_another_projects_objects(self):
        self.authenticate(self.outsider)

        list_response = self.client.get("/api/activities/")
        update_response = self.client.patch(
            f"/api/activities/{self.activity.id}/",
            {"title": "Alterada pelo Postman"},
            format="json",
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data, [])
        self.assertEqual(update_response.status_code, status.HTTP_404_NOT_FOUND)
        self.activity.refresh_from_db()
        self.assertEqual(self.activity.title, "Atividade protegida")

    def test_member_can_change_activity_but_not_project_or_risk(self):
        self.authenticate(self.member)

        activity_response = self.client.patch(
            f"/api/activities/{self.activity.id}/",
            {"title": "Alteração permitida"},
            format="json",
        )
        project_response = self.client.patch(
            f"/api/projects/{self.project.id}/",
            {"name": "Alteração proibida"},
            format="json",
        )
        risk_response = self.client.patch(
            f"/api/risks/{self.risk.id}/",
            {"description": "Alteração proibida"},
            format="json",
        )

        self.assertEqual(activity_response.status_code, status.HTTP_200_OK)
        self.assertEqual(project_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(risk_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_leader_can_change_risk_but_cannot_manage_sprints(self):
        self.authenticate(self.leader)

        risk_response = self.client.patch(
            f"/api/risks/{self.risk.id}/",
            {"description": "Risco revisado"},
            format="json",
        )
        sprint_response = self.client.post(
            "/api/sprints/",
            {
                "project": self.project.id,
                "name": "Sprint indevida",
                "start_date": "2026-09-01",
                "end_date": "2026-09-10",
            },
            format="json",
        )

        self.assertEqual(risk_response.status_code, status.HTTP_200_OK)
        self.assertEqual(sprint_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_manage_project_and_sprints(self):
        self.authenticate(self.manager)

        project_response = self.client.patch(
            f"/api/projects/{self.project.id}/",
            {"name": "Projeto atualizado"},
            format="json",
        )
        sprint_response = self.client.post(
            "/api/sprints/",
            {
                "project": self.project.id,
                "name": "Sprint autorizada",
                "start_date": "2026-09-01",
                "end_date": "2026-09-10",
            },
            format="json",
        )

        self.assertEqual(project_response.status_code, status.HTTP_200_OK)
        self.assertEqual(sprint_response.status_code, status.HTTP_201_CREATED)

    def test_database_rejects_duplicate_project_membership(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ProjectMembers.objects.create(
                    project=self.project,
                    user=self.member,
                    function="Função duplicada",
                )

    def test_active_sprint_task_cannot_be_removed_or_deleted_via_api(self):
        active_sprint = Sprints.objects.create(
            project=self.project,
            name="Sprint ativa",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 10),
            status="ACTIVE",
        )
        protected_activity = Activity.objects.create(
            project=self.project,
            milestone=self.milestone,
            sprint=active_sprint,
            title="Atividade da sprint ativa",
        )
        self.authenticate(self.member)

        remove_response = self.client.patch(
            f"/api/activities/{protected_activity.id}/",
            {"sprint": None},
            format="json",
        )
        delete_response = self.client.delete(
            f"/api/activities/{protected_activity.id}/"
        )

        self.assertEqual(remove_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(delete_response.status_code, status.HTTP_400_BAD_REQUEST)
        protected_activity.refresh_from_db()
        self.assertEqual(protected_activity.sprint_id, active_sprint.id)

    def test_activity_requires_title_and_milestone_but_not_estimate_or_assignee(self):
        self.authenticate(self.member)

        missing_milestone = self.client.post(
            "/api/activities/",
            {"project": self.project.id, "title": "Sem marco"},
            format="json",
        )
        valid_backlog_task = self.client.post(
            "/api/activities/",
            {
                "project": self.project.id,
                "milestone": self.milestone.id,
                "title": "Tarefa válida no backlog",
                "story_points": None,
                "assigned_to": None,
            },
            format="json",
        )

        self.assertEqual(missing_milestone.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(valid_backlog_task.status_code, status.HTTP_201_CREATED)

    def test_entering_sprint_requires_positive_estimate_and_assignee(self):
        planned_sprint = Sprints.objects.create(
            project=self.project,
            name="Sprint planejada",
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 10),
            status="PLANNED",
        )
        self.authenticate(self.member)

        invalid_response = self.client.patch(
            f"/api/activities/{self.activity.id}/",
            {"sprint": planned_sprint.id},
            format="json",
        )
        valid_response = self.client.patch(
            f"/api/activities/{self.activity.id}/",
            {
                "sprint": planned_sprint.id,
                "story_points": 3,
                "assigned_to": self.member.id,
            },
            format="json",
        )

        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("story_points", invalid_response.data)
        self.assertIn("assigned_to", invalid_response.data)
        self.assertEqual(valid_response.status_code, status.HTTP_200_OK)

    def test_estimate_can_be_cleared_when_task_is_not_entering_a_sprint(self):
        self.activity.story_points = 5
        self.activity.save()
        self.authenticate(self.member)

        response = self.client.patch(
            f"/api/activities/{self.activity.id}/",
            {"story_points": None},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["story_points"])
