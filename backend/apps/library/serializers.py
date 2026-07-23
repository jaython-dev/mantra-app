from rest_framework import serializers
from apps.library.models import Category, Book, Chapter, Mantra, Audio


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'display_order', 'is_active']


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    chapters_count = serializers.SerializerMethodField()
    mantras_count = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'category', 'category_name', 'title', 'slug', 'description',
            'author', 'cover_image', 'cover_image_url', 'language', 'estimated_duration',
            'display_order', 'is_published', 'is_premium',
            'chapters_count', 'mantras_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_cover_image_url(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_image.url if obj.cover_image else None

    def get_chapters_count(self, obj):
        return obj.chapters.count()

    def get_mantras_count(self, obj):
        return Mantra.objects.filter(chapter__book=obj).count()


class ChapterSerializer(serializers.ModelSerializer):
    pdf_file_url = serializers.SerializerMethodField()
    mantras_count = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = [
            'id', 'book', 'title', 'chapter_number', 'description',
            'thumbnail', 'pdf_file', 'pdf_file_url', 'display_order',
            'estimated_duration', 'is_published', 'mantras_count'
        ]
        read_only_fields = ['id']

    def get_pdf_file_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(obj.pdf_file.url)
        return obj.pdf_file.url if obj.pdf_file else None

    def get_mantras_count(self, obj):
        return obj.mantras.count()


class AudioSerializer(serializers.ModelSerializer):
    audio_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Audio
        fields = ['id', 'mantra', 'audio_file', 'audio_file_url', 'duration', 'start_time', 'end_time']
        read_only_fields = ['id']

    def get_audio_file_url(self, obj):
        request = self.context.get('request')
        if obj.audio_file and request:
            return request.build_absolute_uri(obj.audio_file.url)
        return obj.audio_file.url if obj.audio_file else None


class MantraSerializer(serializers.ModelSerializer):
    audio = AudioSerializer(read_only=True)

    class Meta:
        model = Mantra
        fields = [
            'id', 'chapter', 'title', 'sanskrit_text', 'gujarati_text',
            'hindi_text', 'english_text', 'meaning', 'notes', 'display_order', 'audio'
        ]
        read_only_fields = ['id']
