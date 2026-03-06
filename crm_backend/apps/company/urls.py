from django.urls import path
from .views import CompanyProfileView

urlpatterns = [
    path("", CompanyProfileView.as_view(), name="company_profile"),
    path("<int:pk>/", CompanyProfileView.as_view(), name="company_profile_detail"),
]