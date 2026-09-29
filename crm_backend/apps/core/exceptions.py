from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import ValidationError as DRFValidationError


def custom_exception_handler(exc, context):
    """
    Translate Django's core ValidationError (e.g. raised by model.full_clean()
    inside a model's save()) into DRF's ValidationError, so it renders as a
    400 JSON response instead of an unhandled 500.
    """
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, "message_dict"):
            exc = DRFValidationError(detail=exc.message_dict)
        else:
            exc = DRFValidationError(detail=exc.messages)

    return drf_exception_handler(exc, context)
