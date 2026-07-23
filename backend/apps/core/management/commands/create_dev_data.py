import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import transaction
from apps.library.models import Category, Book, Chapter, Mantra, Audio
from apps.billing.models import SubscriptionPlan

User = get_user_model()


class Command(BaseCommand):
    help = "Creates development data (superuser, categories, books, and subscription plans)"

    @transaction.atomic
    def handle(self, *args, **options):
        # 1. Superuser
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "adminpass")
            self.stdout.write(self.style.SUCCESS("Superuser 'admin' created with password 'adminpass'"))
        else:
            self.stdout.write(self.style.WARNING("Superuser 'admin' already exists"))

        # 2. Subscription plans
        plan, created = SubscriptionPlan.objects.get_or_create(
            name="Yearly Mantra Pass",
            defaults={
                "duration_days": 365,
                "price": 999.00,
                "currency": "INR",
                "description": "Unlocks all premium books, audio, and commentary for a full year.",
                "is_active": True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Subscription plan 'Yearly Mantra Pass' created."))

        # 3. Create dummy files
        dummy_png = SimpleUploadedFile("dummy.png", b"dummy_png_content", content_type="image/png")
        dummy_mp3 = SimpleUploadedFile("dummy.mp3", b"dummy_mp3_content", content_type="audio/mp3")

        # 4. Categories
        cat1, _ = Category.objects.get_or_create(
            name="Vedic Chants",
            defaults={"icon": dummy_png, "display_order": 1}
        )
        cat2, _ = Category.objects.get_or_create(
            name="Daily Prayers",
            defaults={"icon": dummy_png, "display_order": 2}
        )

        # 5. Book 1: शिवबोधन (Shiv Bodhan)
        book1, created1 = Book.objects.get_or_create(
            slug="shiv-bodhan",
            defaults={
                "category": cat1,
                "title": "शिवबोधन",
                "description": "संपूर्ण शिव स्तोत्र संग्रह",
                "author": "ऋषि व्यास",
                "cover_image": "covers/shiv_bodhan_cover.png",
                "language": "संस्कृत",
                "estimated_duration": 3600,
                "display_order": 1,
                "is_published": True,
                "is_premium": False,
            }
        )

        # Book 2: कुश पवित्रीकरण (Kush Pavitrikaran)
        book2, created2 = Book.objects.get_or_create(
            slug="kush-pavitrikaran",
            defaults={
                "category": cat2,
                "title": "कुश पवित्रीकरण",
                "description": "कुश पवित्रीकरण एवं पूजन विधि",
                "author": "वैदिक ऋषि",
                "cover_image": "covers/kush_pavitrikaran_cover.png",
                "language": "संस्कृत",
                "estimated_duration": 1800,
                "display_order": 2,
                "is_published": True,
                "is_premium": True,
            }
        )

        # Book 3: देह पवित्रीकरण (Deh Pavitrikaran)
        book3, created3 = Book.objects.get_or_create(
            slug="deh-pavitrikaran",
            defaults={
                "category": cat2,
                "title": "देह पवित्रीकरण",
                "description": "शरीर शुद्धि एवं पवित्रता मंत्र",
                "author": "वैदिक ऋषि",
                "cover_image": "covers/deh_pavitrikaran_cover.png",
                "language": "संस्कृत",
                "estimated_duration": 1200,
                "display_order": 3,
                "is_published": True,
                "is_premium": True,
            }
        )

        self.stdout.write(self.style.SUCCESS("Real Sanskrit books created."))

        # Chapters for शिवबोधन
        ch1, _ = Chapter.objects.get_or_create(
            book=book1,
            chapter_number=1,
            defaults={
                "title": "शिवबोधन प्रारंभ",
                "description": "भगवान शिव की स्तुति एवं आराधना का प्रारंभ",
                "thumbnail": dummy_png,
                "pdf_file": "pdfs/swasti_punyahavachanam.pdf",
                "display_order": 1,
                "estimated_duration": 600,
                "is_published": True
            }
        )

        ch2, _ = Chapter.objects.get_or_create(
            book=book1,
            chapter_number=2,
            defaults={
                "title": "शिव संकल्प",
                "description": "मन की पवित्रता और शिव संकल्प मंत्र",
                "thumbnail": dummy_png,
                "pdf_file": "pdfs/swasti_punyahavachanam.pdf",
                "display_order": 2,
                "estimated_duration": 600,
                "is_published": True
            }
        )

        ch3, _ = Chapter.objects.get_or_create(
            book=book1,
            chapter_number=3,
            defaults={
                "title": "शिव स्तुति",
                "description": "शिव महिमा स्तोत्र",
                "thumbnail": dummy_png,
                "pdf_file": "pdfs/swasti_punyahavachanam.pdf",
                "display_order": 3,
                "is_published": True,
                "estimated_duration": 900
            }
        )

        # Real mantras list extracted from PDF pages 1-3
        mantras_data = [
            {
                "title": "भूमिस्र्पशः मंत्र १",
                "sanskrit": "ॐ मही द्यौः पृथिवी च न इमं यज्ञं मिमिक्षताम्। पिपृतां नो भरीमभिः॥",
                "meaning": "We pray to the earth and heaven to support this ceremony."
            },
            {
                "title": "भूमिस्र्पशः मंत्र २",
                "sanskrit": "ॐ भूरसि भूमिरस्यदितिरसि विश्वधाया विश्वस्य भुवनस्य धर्त्री। पृथिवीं यच्छ पृथिवीं दृंह पृथिवीं मा हिंसीः॥",
                "meaning": "O Earth, you support the universe. Maintain our stability."
            },
            {
                "title": "यवप्रक्षेपः मंत्र",
                "sanskrit": "ॐ ओषधयः समवदन्त सोमेन सह राज્ઞा। यस्मै कृणोति ब्राह्मणस्तं राजन् पारयामसि॥",
                "meaning": "May the sacred herbs bring health and longevity."
            },
            {
                "title": "कलश स्थापनम् मंत्र",
                "sanskrit": "ॐ आजिघ्र कलशं मह्या त્વા विशन्त्विन्दવઃ। પુનરૂર્જા નિવર્તસ્વ સા નઃ સહસ્રંધુક્ષ્વોરુધારા પયસ્વતી પુનર્મા વિશાતાદ્રયિઃ॥",
                "meaning": "Establish the sacred water pot representing purity and energy."
            },
            {
                "title": "जलपूरणम् मंत्र",
                "sanskrit": "ॐ वरुणस्योत्तम्भनमसि वरुणस्य स्कम्भसर्जनी स्थो वरुणस्य ऋतसदन्यसि वरुणस्य ऋतसदनमसि वरुणस्य ऋतसदनमासीद॥",
                "meaning": "Fill the kalash with water representing Varuna, the lord of oceans."
            },
            {
                "title": "गन्धप्रक्षेपः मंत्र",
                "sanskrit": "ॐ त्वाङ्गन्धर्वा अखनँस्त्वामिन्द्रस्त्वाम्बृहस्पतिः। त्वामोषधे सोमो राजा विद्वान् यक्ष्मादमुच्यत॥",
                "meaning": "Offer sandal wood scent representing grace and fragrance."
            },
            {
                "title": "धान्यप्रक्षेपः मंत्र",
                "sanskrit": "ॐ धान्यमसि धिनुहि देवान् प्राणाय त्वोदानाय त्वा व्यानाय त्वा। दीर्घामनु प्रसितिमायुषे धान्देवो वः सविता हिरण्यपाणिः प्रतिगृह्णात्वच्छिद्रेण पाणिना चक्षुषे त्वा महीनाम्पयोस ॥",
                "meaning": "Offer food grains representing life force and nourishment."
            },
            {
                "title": "सर्वौषधिप्रक्षेपः मंत्र १",
                "sanskrit": "ॐ या ओषधीः पूर्वा जाता देवेभ्यस्त्रियुगम्पूરા। મનૈ નુ બભ્રૂણામહઁ શતન્ધામનિ સપ્ત ચ॥",
                "meaning": "Sacred herbs created by the gods in ancient times, heal us."
            },
            {
                "title": "सर्वौषधिप्रक्षेपः मंत्र २",
                "sanskrit": "ॐ दीर्घायुस्त ओषधे खनिता यस्मै च त्वा खनाम्यहम्। अथो त्वन्दीर्घायुर्भूत्वा शतवल्शा विरोहतात्॥",
                "meaning": "Let the roots grow and expand for health."
            },
            {
                "title": "सर्वौषधिप्रक्षेपः मंत्र ३",
                "sanskrit": "ॐ या ओषधीः सोमेराज्ञीर्विष्ठिताः पृथिवीमनु। बृहस्पतिप्रसूतास् तस्यै संदत्त वीर्यम्॥",
                "meaning": "Herbs led by Soma, bless us with strength."
            },
            {
                "title": "दुर्वाप्रक्षेपः मंत्र",
                "sanskrit": "ॐ काण्डात्काण्डात्प्ररोहन्ती परुषः परुषस्परि। एवा नो दूर्वे प्रतनु सहस्रेण शतेन च॥",
                "meaning": "May we grow and prosper like the durva grass."
            },
            {
                "title": "पञ्चपल्लवप्रक्षेपः मंत्र",
                "sanskrit": "ॐ अश्वत्थे वो निषदनम्पर्णे वो वसतिष्कृता। गोभाज इत्किलासथ यत्सनवथ पूरुषम्॥",
                "meaning": "We offer five leaves representing nature's five elements."
            }
        ]

        # Seed exactly 50 mantras for Book 1 (शिवबोधन) distributed across its 3 chapters
        for i in range(1, 51):
            if i <= 20:
                ch = ch1
            elif i <= 40:
                ch = ch2
            else:
                ch = ch3

            if i - 1 < len(mantras_data):
                m_data = mantras_data[i - 1]
                title = m_data["title"]
                sanskrit = m_data["sanskrit"]
                meaning = m_data["meaning"]
            else:
                title = f"स्वस्तिपुण्याहवाचनम् - मंत्र {i}"
                sanskrit = f"ॐ स्वस्ति नो मिमीतामश्विना भगः स्वस्ति देवी ददितिर्नवेधसः। (मंत्र {i})"
                meaning = f"Peace prayer mantra number {i} for well-being and prosperity."

            m = Mantra.objects.create(
                chapter=ch,
                title=title,
                sanskrit_text=sanskrit,
                gujarati_text=sanskrit,
                hindi_text=sanskrit,
                english_text=f"Mantra {i}",
                meaning=meaning,
                display_order=i
            )

            Audio.objects.create(
                mantra=m,
                audio_file=dummy_mp3,
                duration=120,
                start_time=0.0,
                end_time=120.0
            )

        # Chapters for कुश पवित्रीकरण
        ch_kush, _ = Chapter.objects.get_or_create(
            book=book2,
            chapter_number=1,
            defaults={
                "title": "कुश पवित्रीकरण विधि",
                "description": "पूजा में प्रयुक्त होने वाली कुश घास का पवित्रीकरण",
                "thumbnail": dummy_png,
                "display_order": 1,
                "estimated_duration": 900,
                "is_published": True
            }
        )
        m_kush = Mantra.objects.create(
            chapter=ch_kush,
            title="कुश पूजा",
            sanskrit_text="ॐ पवित्रं कुरु...",
            gujarati_text="ॐ पवित्रं कुरु...",
            hindi_text="ॐ पवित्रं कुरु...",
            english_text="Kush Puja Mantra",
            meaning="Purify with Kusha grass.",
            display_order=1
        )
        Audio.objects.create(
            mantra=m_kush,
            audio_file=dummy_mp3,
            duration=120,
            start_time=0.0,
            end_time=120.0
        )

        # Chapters for देह पवित्रीकरण
        ch_deh, _ = Chapter.objects.get_or_create(
            book=book3,
            chapter_number=1,
            defaults={
                "title": "देह पवित्रीकरण विधि",
                "description": "पंचमहाभूतों की शुद्धि और पवित्रता मंत्र",
                "thumbnail": dummy_png,
                "display_order": 1,
                "estimated_duration": 600,
                "is_published": True
            }
        )
        m_deh = Mantra.objects.create(
            chapter=ch_deh,
            title="देह शुद्धि",
            sanskrit_text="ॐ अपवित्रः पवित्रो वा...",
            gujarati_text="ॐ अपवित्रः पवित्रो वा...",
            hindi_text="ॐ अपवित्रः पवित्रो वा...",
            english_text="Deh Shuddhi Mantra",
            meaning="Cleanse body and mind.",
            display_order=1
        )
        Audio.objects.create(
            mantra=m_deh,
            audio_file=dummy_mp3,
            duration=120,
            start_time=0.0,
            end_time=120.0
        )

        self.stdout.write(self.style.SUCCESS("All chapters and 50 mantras seeded successfully!"))
