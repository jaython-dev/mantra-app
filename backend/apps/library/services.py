from django.core.exceptions import ValidationError
from django.utils.text import slugify
from apps.library.models import Category, Book, Chapter, Mantra, Audio


def create_category(name: str, icon, display_order: int) -> Category:
    """
    Service to create a new Category. Enforces display_order unique.
    """
    if Category.objects.filter(display_order=display_order).exists():
        raise ValidationError({"display_order": "Display order already exists."})
    category = Category.objects.create(name=name, icon=icon, display_order=display_order)
    return category


def create_book(category: Category, title: str, description: str, author: str,
                cover_image, language: str, estimated_duration: int,
                display_order: int, is_published: bool = False, is_premium: bool = False) -> Book:
    """
    Service to create a new Book. Enforces unique slug and category display order.
    """
    slug = slugify(title)
    if Book.objects.filter(slug=slug).exists():
        raise ValidationError({"slug": "A book with this slug already exists."})
    
    if Book.objects.filter(category=category, display_order=display_order).exists():
        raise ValidationError({"display_order": "Display order already exists for this category."})
        
    book = Book.objects.create(
        category=category, title=title, slug=slug, description=description,
        author=author, cover_image=cover_image, language=language,
        estimated_duration=estimated_duration, display_order=display_order,
        is_published=is_published, is_premium=is_premium
    )
    return book


def create_chapter(book: Book, title: str, chapter_number: int, description: str,
                   thumbnail, display_order: int, estimated_duration: int,
                   is_published: bool = False) -> Chapter:
    """
    Service to create a new Chapter. Enforces unique display_order and chapter_number within the book.
    """
    if Chapter.objects.filter(book=book, display_order=display_order).exists():
        raise ValidationError({"display_order": "Display order already exists for this book."})
        
    if Chapter.objects.filter(book=book, chapter_number=chapter_number).exists():
        raise ValidationError({"chapter_number": f"Chapter number {chapter_number} already exists for this book."})
        
    chapter = Chapter.objects.create(
        book=book, title=title, chapter_number=chapter_number, description=description,
        thumbnail=thumbnail, display_order=display_order, estimated_duration=estimated_duration,
        is_published=is_published
    )
    return chapter


def create_mantra(chapter: Chapter, title: str, sanskrit_text: str, gujarati_text: str,
                  hindi_text: str, english_text: str, meaning: str, notes: str,
                  display_order: int) -> Mantra:
    """
    Service to create a new Mantra. Enforces display order uniqueness within the chapter.
    """
    if Mantra.objects.filter(chapter=chapter, display_order=display_order).exists():
        raise ValidationError({"display_order": "Display order already exists for this chapter."})
        
    mantra = Mantra.objects.create(
        chapter=chapter, title=title, sanskrit_text=sanskrit_text,
        gujarati_text=gujarati_text, hindi_text=hindi_text, english_text=english_text,
        meaning=meaning, notes=notes, display_order=display_order
    )
    return mantra


def create_audio(mantra: Mantra, audio_file, duration: int, start_time: float = 0.0, end_time: float = 0.0) -> Audio:
    """
    Service to associate an Audio file with a Mantra.
    """
    if Audio.objects.filter(mantra=mantra).exists():
        raise ValidationError({"mantra": "Audio already exists for this mantra."})
        
    audio = Audio.objects.create(
        mantra=mantra, audio_file=audio_file, duration=duration,
        start_time=start_time, end_time=end_time
    )
    return audio
