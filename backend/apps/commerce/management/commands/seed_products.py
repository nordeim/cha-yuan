"""
Management command to seed tea products, categories, and origins.

Usage:
    python manage.py seed_products
    python manage.py seed_products --clear  # Clear existing data first

Creates sample tea products for the CHA YUAN catalog with:
- Tea categories (Green, Black, Oolong, White, Pu-erh)
- Origins (China, Taiwan, India, Japan)
- Sample products with realistic pricing in SGD
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal

from apps.commerce.models import TeaCategory, Origin, Product


class Command(BaseCommand):
    """Seed product catalog data."""

    help = "Create sample tea products with categories and origins"

    def add_arguments(self, parser):
        """Add command arguments."""
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing product data before seeding",
        )

    def handle(self, *args, **options):
        """Execute the command."""
        if options["clear"]:
            self.clear_existing_data()

        self.stdout.write(self.style.SUCCESS("Seeding tea catalog..."))

        with transaction.atomic():
            # Create categories first
            categories = self.create_categories()
            self.stdout.write(f"  Created {len(categories)} categories")

            # Create origins
            origins = self.create_origins()
            self.stdout.write(f"  Created {len(origins)} origins")

            # Create products
            products = self.create_products(categories, origins)
            self.stdout.write(f"  Created {len(products)} products")

        self.stdout.write(self.style.SUCCESS("\nCatalog seeding complete!"))
        self.stdout.write(f"  - Categories: {TeaCategory.objects.count()}")
        self.stdout.write(f"  - Origins: {Origin.objects.count()}")
        self.stdout.write(f"  - Products: {Product.objects.count()}")

    def clear_existing_data(self):
        """Clear existing product data."""
        self.stdout.write(self.style.WARNING("Clearing existing product data..."))
        Product.objects.all().delete()
        TeaCategory.objects.all().delete()
        Origin.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Existing data cleared"))

    def create_categories(self) -> dict:
        """Create tea categories with brewing guides."""
        categories_data = [
            {
                "name": "Green Tea",
                "slug": "green-tea",
                "fermentation_level": 0,
                "description": "Unoxidized tea with fresh, grassy flavors. High in antioxidants.",
                "brewing_temp_celsius": 80,
                "brewing_time_seconds": 120,
            },
            {
                "name": "Black Tea",
                "slug": "black-tea",
                "fermentation_level": 100,
                "description": "Fully oxidized tea with bold, robust flavors. Highest caffeine content.",
                "brewing_temp_celsius": 95,
                "brewing_time_seconds": 180,
            },
            {
                "name": "Oolong Tea",
                "slug": "oolong",
                "fermentation_level": 50,
                "description": "Partially oxidized tea with complex floral and fruity notes.",
                "brewing_temp_celsius": 90,
                "brewing_time_seconds": 150,
            },
            {
                "name": "White Tea",
                "slug": "white-tea",
                "fermentation_level": 5,
                "description": "Minimally processed tea with delicate, subtle flavors. Lowest caffeine.",
                "brewing_temp_celsius": 75,
                "brewing_time_seconds": 180,
            },
            {
                "name": "Pu-erh Tea",
                "slug": "puerh",
                "fermentation_level": 80,
                "description": "Aged and fermented tea with earthy, mellow flavors. Aids digestion.",
                "brewing_temp_celsius": 100,
                "brewing_time_seconds": 240,
            },
        ]

        categories = {}
        for data in categories_data:
            category, created = TeaCategory.objects.get_or_create(
                slug=data["slug"],
                defaults=data,
            )
            categories[data["slug"]] = category
            action = "Created" if created else "Exists"
            self.stdout.write(f"    {action}: {category.name}")

        return categories

    def create_origins(self) -> dict:
        """Create tea origins."""
        origins_data = [
            {
                "name": "Hangzhou, China",
                "slug": "hangzhou-china",
                "region": "Zhejiang Province",
                "description": "Famous for Dragon Well (Longjing) tea. Misty mountains and mineral-rich soil.",
            },
            {
                "name": "Fujian, China",
                "slug": "fujian-china",
                "region": "Fujian Province",
                "description": "Birthplace of oolong and white tea. Wuyi Mountains and Anxi County.",
            },
            {
                "name": "Alishan, Taiwan",
                "slug": "alishan-taiwan",
                "region": "Chiayi County",
                "description": "High mountain oolongs grown at 1000m+ elevation. Misty climate creates complex flavors.",
            },
            {
                "name": "Darjeeling, India",
                "slug": "darjeeling-india",
                "region": "West Bengal",
                "description": "The 'Champagne of Teas'. Grown in the Himalayan foothills with distinct flushes.",
            },
            {
                "name": "Uji, Japan",
                "slug": "uji-japan",
                "region": "Kyoto Prefecture",
                "description": "Historic tea region known for matcha and gyokuro. Shade-grown techniques.",
            },
            {
                "name": "Yunnan, China",
                "slug": "yunnan-china",
                "region": "Yunnan Province",
                "description": "Ancient tea forests and the birthplace of pu-erh. Rich biodiversity.",
            },
        ]

        origins = {}
        for data in origins_data:
            origin, created = Origin.objects.get_or_create(
                slug=data["slug"],
                defaults=data,
            )
            origins[data["slug"]] = origin
            action = "Created" if created else "Exists"
            self.stdout.write(f"    {action}: {origin.name}")

        return origins

    def create_products(self, categories: dict, origins: dict) -> list:
        """Create sample tea products."""
        products_data = [
            # Green Teas
            {
                "name": "Dragon Well (Longjing) - Premium",
                "slug": "dragon-well-premium",
                "description": "Flat-pressed leaves with chestnut aroma. Hangzhou's most famous green tea.",
                "category": "green-tea",
                "origin": "hangzhou-china",
                "price_sgd": Decimal("28.00"),
                "stock": 50,
                "weight_grams": 100,
                "harvest_season": "spring",
                "harvest_year": 2026,
            },
            {
                "name": "Sencha - First Flush",
                "slug": "sencha-first-flush",
                "description": "Steamed Japanese green tea with fresh grass and umami notes.",
                "category": "green-tea",
                "origin": "uji-japan",
                "price_sgd": Decimal("22.00"),
                "stock": 45,
                "weight_grams": 80,
                "harvest_season": "spring",
                "harvest_year": 2026,
            },
            {
                "name": "Matcha - Ceremonial Grade",
                "slug": "matcha-ceremonial",
                "description": "Stone-ground shade-grown tea. Vibrant green with sweet umami.",
                "category": "green-tea",
                "origin": "uji-japan",
                "price_sgd": Decimal("45.00"),
                "stock": 30,
                "weight_grams": 30,
                "harvest_season": "spring",
                "harvest_year": 2026,
                "is_new_arrival": True,
            },
            # Oolong Teas
            {
                "name": "Tieguanyin - Iron Goddess",
                "slug": "tieguanyin-iron-goddess",
                "description": "Rolled oolong with orchid fragrance and creamy mouthfeel.",
                "category": "oolong",
                "origin": "fujian-china",
                "price_sgd": Decimal("32.00"),
                "stock": 40,
                "weight_grams": 100,
                "harvest_season": "autumn",
                "harvest_year": 2026,
            },
            {
                "name": "Alishan High Mountain Oolong",
                "slug": "alishan-high-mountain",
                "description": "Elevation-grown with floral sweetness and silky texture.",
                "category": "oolong",
                "origin": "alishan-taiwan",
                "price_sgd": Decimal("38.00"),
                "stock": 35,
                "weight_grams": 100,
                "harvest_season": "winter",
                "harvest_year": 2025,
                "is_new_arrival": True,
            },
            {
                "name": "Oriental Beauty",
                "slug": "oriental-beauty",
                "description": "Bug-bitten tea with honey sweetness and fruity complexity.",
                "category": "oolong",
                "origin": "alishan-taiwan",
                "price_sgd": Decimal("42.00"),
                "stock": 25,
                "weight_grams": 100,
                "harvest_season": "summer",
                "harvest_year": 2026,
            },
            # Black Teas
            {
                "name": "Darjeeling First Flush",
                "slug": "darjeeling-first-flush",
                "description": "Spring harvest with floral notes and light golden liquor.",
                "category": "black-tea",
                "origin": "darjeeling-india",
                "price_sgd": Decimal("35.00"),
                "stock": 30,
                "weight_grams": 100,
                "harvest_season": "spring",
                "harvest_year": 2026,
            },
            {
                "name": "Sun Moon Lake Ruby Black",
                "slug": "sun-moon-lake-ruby",
                "description": "Taiwanese black tea with cinnamon and mint notes.",
                "category": "black-tea",
                "origin": "alishan-taiwan",
                "price_sgd": Decimal("28.00"),
                "stock": 40,
                "weight_grams": 100,
                "harvest_season": "summer",
                "harvest_year": 2026,
            },
            # White Teas
            {
                "name": "Silver Needle (Baihao Yinzhen)",
                "slug": "silver-needle",
                "description": "Pure bud tea with honey sweetness and delicate apricot notes.",
                "category": "white-tea",
                "origin": "fujian-china",
                "price_sgd": Decimal("48.00"),
                "stock": 20,
                "weight_grams": 50,
                "harvest_season": "spring",
                "harvest_year": 2026,
            },
            {
                "name": "White Peony (Baimudan)",
                "slug": "white-peony",
                "description": "Bud and leaf blend with melon sweetness and light body.",
                "category": "white-tea",
                "origin": "fujian-china",
                "price_sgd": Decimal("32.00"),
                "stock": 35,
                "weight_grams": 100,
                "harvest_season": "spring",
                "harvest_year": 2026,
            },
            # Pu-erh Teas
            {
                "name": "Aged Pu-erh - 2018 Vintage",
                "slug": "aged-puerh-2018",
                "description": "5-year aged ripe pu-erh with earthy smoothness and sweet finish.",
                "category": "puerh",
                "origin": "yunnan-china",
                "price_sgd": Decimal("58.00"),
                "stock": 25,
                "weight_grams": 200,
                "harvest_season": "autumn",
                "harvest_year": 2018,
            },
            {
                "name": "Raw Pu-erh Cake - 2024 Spring",
                "slug": "raw-puerh-2024",
                "description": "Young sheng pu-erh with bright energy and floral notes. Age-worthy.",
                "category": "puerh",
                "origin": "yunnan-china",
                "price_sgd": Decimal("42.00"),
                "stock": 15,
                "weight_grams": 357,
                "harvest_season": "spring",
                "harvest_year": 2024,
            },
        ]

        products = []
        for data in products_data:
            category = categories[data.pop("category")]
            origin = origins[data.pop("origin")]

            product, created = Product.objects.get_or_create(
                slug=data["slug"],
                defaults={
                    **data,
                    "category": category,
                    "origin": origin,
                    "is_available": True,
                },
            )
            products.append(product)
            action = "Created" if created else "Exists"
            self.stdout.write(f"    {action}: {product.name}")

        return products
