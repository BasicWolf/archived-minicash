from django.contrib.auth import views as auth_views

from django.conf.urls import url


urlpatterns = [
    url(
        r'^login/$',
        auth_views.login,
        {'template_name': 'frontend/login.html'},
        name='login',
    ),

    url(
        r'^logout/$',
        auth_views.logout,
        name='logout'
    )
]
