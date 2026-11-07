from django.test import TestCase
from django.urls import reverse

from .models import Areas, Categories


class DeploymentReadinessTests(TestCase):
    def test_health_check_is_public(self):
        response = self.client.get(reverse("health-check"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_initial_project_options_are_available(self):
        self.assertTrue(Areas.objects.filter(name="TI").exists())
        self.assertTrue(
            Categories.objects.filter(name="Desenvolvimento de Software").exists()
        )
