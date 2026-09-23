"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework import routers
from gestao import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r"users", views.UsersViewSet)
router.register(r"areas", views.AreasViewSet)
router.register(r"categories", views.CategoriesViewSet)
router.register(r"projects", views.ProjectsViewSet, basename="project")
router.register(r"canvas", views.CanvasViewSet, basename="canvas")
router.register(r"risks", views.RisksViewSet, basename="risk")
router.register(r"communications", views.CommunicationViewSet, basename="communication")
router.register(r"members", views.ProjectMembersViewSet, basename="member")
router.register(r"activities", views.ActivitiesViewSet, basename="activity")
router.register(r"milestones", views.MilestonesViewSet, basename="milestone")
router.register(r"sprints", views.SprintsViewSet, basename="sprint")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/me/", views.UserMeView.as_view(), name="user-me"),
    path("api/register/", views.RegisterView.as_view(), name="register"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
