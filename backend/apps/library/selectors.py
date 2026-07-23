from django.db.models import Q, QuerySet
from apps.library.models import Category, Book, Chapter, Mantra, Audio


def get_active_categories() -> QuerySet[Category]:
    """
    Returns all active categories sorted by display_order.
    """
    return Category.objects.filter(is_active=True).order_by('display_order')


def get_books(category_id: str = None, search: str = None, user_is_staff: bool = False) -> QuerySet[Book]:
    """
    Filters and returns books based on category, publishing status, and text search query.
    """
    queryset = Book.objects.all()
    
    # Hide unpublished books for regular users
    if not user_is_staff:
        queryset = queryset.filter(is_published=True)

    if category_id:
        queryset = queryset.filter(category_id=category_id)

    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(author__icontains=search) |
            Q(description__icontains=search)
        )

    return queryset.order_by('display_order')


def get_chapters(book_id: str, user_is_staff: bool = False) -> QuerySet[Chapter]:
    """
    Returns chapters inside a specific book.
    """
    queryset = Chapter.objects.filter(book_id=book_id)
    if not user_is_staff:
        queryset = queryset.filter(is_published=True)
    return queryset.order_by('display_order')


def get_mantras(chapter_id: str, search: str = None) -> QuerySet[Mantra]:
    """
    Returns mantras within a chapter, optionally filtering by text translations.
    """
    queryset = Mantra.objects.filter(chapter_id=chapter_id)
    
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(sanskrit_text__icontains=search) |
            Q(gujarati_text__icontains=search) |
            Q(hindi_text__icontains=search) |
            Q(english_text__icontains=search) |
            Q(meaning__icontains=search)
        )
        
    return queryset.order_by('display_order')


def search_all_mantras(search: str) -> QuerySet[Mantra]:
    """
    Global search for mantras across all chapters.
    """
    if not search:
        return Mantra.objects.none()
        
    return Mantra.objects.filter(
        Q(title__icontains=search) |
        Q(sanskrit_text__icontains=search) |
        Q(gujarati_text__icontains=search) |
        Q(hindi_text__icontains=search) |
        Q(english_text__icontains=search) |
        Q(meaning__icontains=search)
    ).order_by('chapter__book__display_order', 'chapter__display_order', 'display_order')
