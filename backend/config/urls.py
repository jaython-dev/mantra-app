from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.path if hasattr(admin.site, 'path') else admin.site.urls),
    
    # OpenAPI Schema & API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints under v1
    path('api/v1/auth/', include('apps.accounts.urls_auth')),
    path('api/v1/profile/', include('apps.accounts.urls_profile')),
    path('api/v1/categories/', include('apps.library.urls_categories')),
    path('api/v1/books/', include('apps.library.urls_books')),
    path('api/v1/chapters/', include('apps.library.urls_chapters')),
    path('api/v1/mantras/', include('apps.library.urls_mantras')),
    path('api/v1/audio/', include('apps.library.urls_audio')),
    path('api/v1/subscription-plans/', include('apps.billing.urls_plans')),
    path('api/v1/subscriptions/', include('apps.billing.urls_subscriptions')),
    path('api/v1/payments/', include('apps.billing.urls_payments')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
