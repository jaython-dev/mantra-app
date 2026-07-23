from django.contrib import admin
from django.utils.html import format_html
from apps.library.models import Category, Book, Chapter, Mantra, Audio


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_order', 'is_active', 'icon_preview')
    readonly_fields = ('icon_preview', 'created_at', 'updated_at')
    search_fields = ('name',)
    ordering = ('display_order',)
    fieldsets = (
        (None, {
            'fields': ('name', 'icon', 'icon_preview', 'display_order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def icon_preview(self, obj):
        if obj.icon:
            return format_html('<img src="{}" style="max-height: 50px; border-radius: 4px;" />', obj.icon.url)
        return "No image"
    icon_preview.short_description = "Preview"


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 0
    fields = ('chapter_number', 'title', 'pdf_file', 'is_published', 'estimated_duration', 'display_order')


class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'language', 'is_published', 'is_premium', 'display_order', 'cover_preview')
    list_filter = ('category', 'is_published', 'is_premium', 'language')
    search_fields = ('title', 'author', 'description')
    readonly_fields = ('cover_preview', 'created_at', 'updated_at')
    inlines = [ChapterInline]
    prepopulated_fields = {"slug": ("title",)}
    actions = ['bulk_publish', 'bulk_unpublish']
    fieldsets = (
        (None, {
            'fields': (
                'is_active', 'category', 'title', 'slug', 'description', 'author',
                'cover_image', 'cover_preview', 'language', 'estimated_duration',
                'display_order', 'is_published', 'is_premium'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="max-height: 50px; border-radius: 4px;" />', obj.cover_image.url)
        return "No image"
    cover_preview.short_description = "Preview"

    def bulk_publish(self, request, queryset):
        rows_updated = queryset.update(is_published=True)
        self.message_user(request, f"{rows_updated} books were successfully published.")
    bulk_publish.short_description = "Publish selected Books"

    def bulk_unpublish(self, request, queryset):
        rows_updated = queryset.update(is_published=False)
        self.message_user(request, f"{rows_updated} books were successfully unpublished.")
    bulk_unpublish.short_description = "Unpublish selected Books"


class MantraInline(admin.TabularInline):
    model = Mantra
    extra = 0
    fields = ('title', 'display_order')


class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'book', 'chapter_number', 'pdf_file', 'is_published', 'display_order', 'thumbnail_preview')
    list_filter = ('book', 'is_published')
    search_fields = ('title', 'description')
    readonly_fields = ('thumbnail_preview', 'created_at', 'updated_at')
    inlines = [MantraInline]
    actions = ['bulk_publish', 'bulk_unpublish']
    fieldsets = (
        (None, {
            'fields': (
                'is_active', 'book', 'title', 'chapter_number', 'description',
                'thumbnail', 'thumbnail_preview', 'pdf_file', 'estimated_duration',
                'display_order', 'is_published'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="max-height: 50px; border-radius: 4px;" />', obj.thumbnail.url)
        return "No image"
    thumbnail_preview.short_description = "Preview"

    def bulk_publish(self, request, queryset):
        rows_updated = queryset.update(is_published=True)
        self.message_user(request, f"{rows_updated} chapters were successfully published.")
    bulk_publish.short_description = "Publish selected Chapters"

    def bulk_unpublish(self, request, queryset):
        rows_updated = queryset.update(is_published=False)
        self.message_user(request, f"{rows_updated} chapters were successfully unpublished.")
    bulk_unpublish.short_description = "Unpublish selected Chapters"


class AudioInline(admin.StackedInline):
    model = Audio
    extra = 0
    fields = ('audio_file', 'duration', 'start_time', 'end_time')


class MantraAdmin(admin.ModelAdmin):
    list_display = ('title', 'chapter', 'display_order')
    list_filter = ('chapter__book', 'chapter')
    search_fields = ('title', 'sanskrit_text', 'gujarati_text', 'hindi_text', 'english_text', 'meaning')
    inlines = [AudioInline]
    readonly_fields = ('created_at', 'updated_at')


class AudioAdmin(admin.ModelAdmin):
    list_display = ('mantra', 'audio_file', 'duration', 'audio_preview')
    readonly_fields = ('audio_preview', 'created_at', 'updated_at')

    def audio_preview(self, obj):
        if obj.audio_file:
            return format_html('<audio controls src="{}" style="max-height: 35px;"></audio>', obj.audio_file.url)
        return "No audio"
    audio_preview.short_description = "Audio Preview"


admin.site.register(Category, CategoryAdmin)
admin.site.register(Book, BookAdmin)
admin.site.register(Chapter, ChapterAdmin)
admin.site.register(Mantra, MantraAdmin)
admin.site.register(Audio, AudioAdmin)
