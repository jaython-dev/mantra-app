import os
from django.core.exceptions import ValidationError


def validate_mp3_file(value):
    """
    Validates that a file has an .mp3 extension.
    """
    ext = os.path.splitext(value.name)[1]
    if ext.lower() != '.mp3':
        raise ValidationError('Unsupported file extension. Only MP3 audio files are allowed.')


def validate_image_file(value):
    """
    Validates that a file is a valid image (JPG, JPEG, PNG, or WEBP).
    """
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if ext.lower() not in valid_extensions:
        raise ValidationError('Unsupported image extension. Only JPG, PNG, and WEBP image files are allowed.')


def validate_pdf_file(value):
    """
    Validates that a file is a valid PDF document.
    """
    ext = os.path.splitext(value.name)[1]
    if ext.lower() != '.pdf':
        raise ValidationError('Unsupported file extension. Only PDF documents are allowed.')


from django.utils.deconstruct import deconstructible

@deconstructible
class FileSizeValidator:
    """
    Validator to check that file size is under the maximum limit.
    """
    def __init__(self, max_mb=10):
        self.max_mb = max_mb

    def __call__(self, value):
        limit = self.max_mb * 1024 * 1024
        if value.size > limit:
            raise ValidationError(f'File size exceeds the limit of {self.max_mb} MB.')

    def __eq__(self, other):
        return isinstance(other, FileSizeValidator) and self.max_mb == other.max_mb


def validate_file_size(max_mb=10):
    return FileSizeValidator(max_mb)
