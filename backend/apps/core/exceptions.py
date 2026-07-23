import logging
from django.conf import settings
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def mantra_exception_handler(exc, context):
    """
    Custom exception handler to format all errors to:
    {
        "success": false,
        "message": "Validation Error",
        "errors": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        
        # If already formatted, return as is
        if isinstance(errors, dict) and 'success' in errors:
            return response

        message = "An error occurred"
        
        if isinstance(errors, dict):
            if 'detail' in errors:
                message = str(errors['detail'])
            else:
                message = "Validation Error"
        elif isinstance(errors, list):
            message = str(errors[0]) if errors else "Validation Error"
            errors = {"non_field_errors": errors}
        else:
            errors = {"detail": str(errors)}

        response.data = {
            "success": False,
            "message": message,
            "errors": errors
        }
    else:
        # Unhandled exceptions (database errors, coding bugs)
        logger.error(f"Unhandled Exception: {exc}", exc_info=True)
        
        # Let standard Django handle it in debug mode to display traceback
        if settings.DEBUG:
            return None

        response = Response({
            "success": False,
            "message": "Internal Server Error",
            "errors": {"non_field_errors": [str(exc)]}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
