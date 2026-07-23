from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from apps.core.permissions import HasActiveSubscriptionOrFreeContent
from apps.library.models import Category, Book, Chapter, Mantra, Audio
from apps.library.serializers import (
    CategorySerializer,
    BookSerializer,
    ChapterSerializer,
    MantraSerializer,
    AudioSerializer,
)
from apps.library.selectors import (
    get_active_categories,
    get_books,
    get_chapters,
    get_mantras,
    search_all_mantras,
)


class CategoryListAPIView(APIView):
    """
    List all active categories.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={200: CategorySerializer(many=True)})
    def get(self, request):
        categories = get_active_categories()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class BookListAPIView(APIView):
    """
    List all published books. Supports category filtering and search parameters.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='category', type=str, description='Filter books by Category UUID'),
            OpenApiParameter(name='search', type=str, description='Search books by title, author, or description'),
        ],
        responses={200: BookSerializer(many=True)}
    )
    def get(self, request):
        category_id = request.query_params.get('category')
        search = request.query_params.get('search')
        
        user_is_staff = request.user.is_staff if request.user and request.user.is_authenticated else False
        books = get_books(
            category_id=category_id,
            search=search,
            user_is_staff=user_is_staff
        )
        serializer = BookSerializer(books, many=True, context={'request': request})
        return Response(serializer.data)


class BookDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieve single Book details. Restricts premium books to active subscribers.
    """
    permission_classes = [HasActiveSubscriptionOrFreeContent]
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    lookup_field = 'id'


class BookChaptersAPIView(APIView):
    """
    List all chapters associated with a specific book. Gated by Book subscription status.
    """
    permission_classes = [HasActiveSubscriptionOrFreeContent]

    @extend_schema(responses={200: ChapterSerializer(many=True)})
    def get(self, request, book_id):
        # Fetch book and check object permission (subscription check)
        book = get_object_or_404(Book, id=book_id)
        self.check_object_permissions(request, book)
        
        user_is_staff = request.user.is_staff if request.user and request.user.is_authenticated else False
        chapters = get_chapters(book_id=book_id, user_is_staff=user_is_staff)
        serializer = ChapterSerializer(chapters, many=True, context={'request': request})
        return Response(serializer.data)


class ChapterDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieve single Chapter details. Restricts chapters inside premium books to active subscribers.
    """
    permission_classes = [HasActiveSubscriptionOrFreeContent]
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    lookup_field = 'id'


class ChapterMantrasAPIView(APIView):
    """
    List all mantras inside a specific chapter. Gated by Chapter parent book subscription.
    """
    permission_classes = [HasActiveSubscriptionOrFreeContent]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='search', type=str, description='Filter mantras by search term in any translation text')
        ],
        responses={200: MantraSerializer(many=True)}
    )
    def get(self, request, chapter_id):
        chapter = get_object_or_404(Chapter, id=chapter_id)
        self.check_object_permissions(request, chapter)
        
        search = request.query_params.get('search')
        mantras = get_mantras(chapter_id=chapter_id, search=search)
        serializer = MantraSerializer(mantras, many=True, context={'request': request})
        return Response(serializer.data)


class MantraDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieve single Mantra details. Restricts premium mantras to active subscribers.
    """
    permission_classes = [HasActiveSubscriptionOrFreeContent]
    queryset = Mantra.objects.all()
    serializer_class = MantraSerializer
    lookup_field = 'id'


class MantraAudioAPIView(APIView):
    """
    Retrieve audio metadata associated with a specific mantra. Gated by subscription status.
    """
    permission_classes = [HasActiveSubscriptionOrFreeContent]

    @extend_schema(responses={200: AudioSerializer})
    def get(self, request, mantra_id):
        mantra = get_object_or_404(Mantra, id=mantra_id)
        self.check_object_permissions(request, mantra)
        
        audio = get_object_or_404(Audio, mantra=mantra)
        serializer = AudioSerializer(audio, context={'request': request})
        return Response(serializer.data)


class MantraSearchAPIView(APIView):
    """
    Global search for mantras across all chapters and translations.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='search', type=str, required=True, description='Query term matching Sanskrit, Gujarati, Hindi, or English translation')
        ],
        responses={200: MantraSerializer(many=True)}
    )
    def get(self, request):
        search = request.query_params.get('search', '')
        mantras = search_all_mantras(search=search)
        serializer = MantraSerializer(mantras, many=True, context={'request': request})
        return Response(serializer.data)
