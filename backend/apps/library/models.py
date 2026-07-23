from django.db import models
from django.utils.text import slugify
from apps.core.models import BaseModel
from apps.core.validators import validate_image_file, validate_mp3_file, validate_file_size, validate_pdf_file


class Category(BaseModel):
    """
    Groups books and audiobook albums.
    """
    name = models.CharField(max_length=255)
    icon = models.ImageField(
        upload_to='covers/',
        blank=True,
        null=True,
        validators=[validate_image_file, validate_file_size(2)]
    )
    display_order = models.PositiveIntegerField(unique=True)

    class Meta:
        ordering = ['display_order']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Book(BaseModel):
    """
    Audiobook album containing multiple chapters.
    """
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='books'
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    author = models.CharField(max_length=255)
    cover_image = models.ImageField(
        upload_to='covers/',
        blank=True,
        null=True,
        validators=[validate_image_file, validate_file_size(5)]
    )
    language = models.CharField(max_length=100)
    estimated_duration = models.PositiveIntegerField(
        help_text="Estimated duration in seconds"
    )
    display_order = models.PositiveIntegerField()
    is_published = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)

    class Meta:
        ordering = ['display_order']
        unique_together = ('category', 'display_order')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Chapter(BaseModel):
    """
    Specific chapters in a book.
    """
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='chapters'
    )
    title = models.CharField(max_length=255)
    chapter_number = models.PositiveIntegerField()
    description = models.TextField()
    thumbnail = models.ImageField(
        upload_to='thumbnails/',
        blank=True,
        null=True,
        validators=[validate_image_file, validate_file_size(2)]
    )
    pdf_file = models.FileField(
        upload_to='pdfs/',
        blank=True,
        null=True,
        validators=[validate_pdf_file, validate_file_size(50)]
    )
    display_order = models.PositiveIntegerField()
    estimated_duration = models.PositiveIntegerField(
        help_text="Estimated duration in seconds"
    )
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ['display_order']
        unique_together = (
            ('book', 'display_order'),
            ('book', 'chapter_number')
        )

    def __str__(self):
        return f"{self.book.title} - Ch {self.chapter_number}: {self.title}"


class Mantra(BaseModel):
    """
    Individual mantras contained in a chapter page.
    """
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name='mantras'
    )
    title = models.CharField(max_length=255)
    sanskrit_text = models.TextField()
    gujarati_text = models.TextField()
    hindi_text = models.TextField()
    english_text = models.TextField()
    meaning = models.TextField()
    notes = models.TextField(blank=True, null=True)
    display_order = models.PositiveIntegerField()

    class Meta:
        ordering = ['display_order']
        unique_together = ('chapter', 'display_order')

    def __str__(self):
        return f"{self.chapter.title} - Mantra {self.display_order}: {self.title}"


class Audio(BaseModel):
    """
    Audio track mapped directly to a specific mantra.
    """
    mantra = models.OneToOneField(
        Mantra,
        on_delete=models.CASCADE,
        related_name='audio'
    )
    audio_file = models.FileField(
        upload_to='audio/',
        validators=[validate_mp3_file, validate_file_size(20)]
    )
    duration = models.PositiveIntegerField(
        help_text="Duration in seconds"
    )
    start_time = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.0
    )
    end_time = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.0
    )

    class Meta:
        verbose_name_plural = 'Audios'

    def __str__(self):
        return f"Audio for {self.mantra.title}"
