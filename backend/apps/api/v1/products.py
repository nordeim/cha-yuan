"""
Django Ninja API Endpoints for Product Catalog
Implements GET endpoints for products, categories, and origins
"""

from typing import List, Optional
from decimal import Decimal

from django.db import models
from ninja import Router, Schema, Query
from ninja.pagination import paginate, PageNumberPagination

from apps.commerce.models import Product, TeaCategory, Origin


router = Router(tags=["products"])


# ==================== SCHEMAS ====================


class OriginSchema(Schema):
    """Origin response schema."""

    id: int
    name: str
    slug: str
    region: str
    description: str
    image: Optional[str] = None


class CategorySchema(Schema):
    """Category response schema."""

    id: int
    name: str
    slug: str
    fermentation_level: int
    description: str
    brewing_temp_celsius: int
    brewing_time_seconds: int


class BrewingGuideSchema(Schema):
    """Brewing guide for product detail."""

    temperature_celsius: int
    time_seconds: int
    time_display: str


class ProductListSchema(Schema):
    """Product list item schema."""

    id: int
    name: str
    slug: str
    short_description: str
    price_sgd: Decimal
    price_with_gst: Decimal
    gst_amount: Decimal
    currency: str = "SGD"
    weight_grams: int
    weight_display: str
    is_in_stock: bool
    is_new_arrival: bool
    harvest_season: Optional[str]
    harvest_year: Optional[int]
    category: CategorySchema
    origin: OriginSchema
    image: Optional[str] = None


class ProductDetailSchema(Schema):
    """Full product detail schema."""

    id: int
    name: str
    slug: str
    description: str
    short_description: str
    price_sgd: Decimal
    price_with_gst: Decimal
    gst_amount: Decimal
    currency: str = "SGD"
    weight_grams: int
    weight_display: str
    stock: int
    is_in_stock: bool
    is_new_arrival: bool
    harvest_season: Optional[str]
    harvest_year: Optional[int]
    category: CategorySchema
    origin: OriginSchema
    brewing_guide: BrewingGuideSchema
    image: Optional[str] = None
    images: List[str]
    related_products: List[ProductListSchema]


class CategoryListSchema(Schema):
    """Category with product count."""

    id: int
    name: str
    slug: str
    description: str
    product_count: int


class OriginListSchema(Schema):
    """Origin with tea count."""

    id: int
    name: str
    slug: str
    region: str
    description: str
    image: Optional[str] = None
    product_count: int


class ProductFilterSchema(Schema):
    """Query parameters for product filtering."""

    category: Optional[str] = None
    origin: Optional[str] = None
    fermentation_min: Optional[int] = None
    fermentation_max: Optional[int] = None
    season: Optional[str] = None
    price_min: Optional[Decimal] = None
    price_max: Optional[Decimal] = None
    in_stock: Optional[bool] = None


# ==================== ENDPOINTS ====================


@router.get("/", response=List[ProductListSchema])
@paginate(PageNumberPagination, page_size=12)
def list_products(request, filters: ProductFilterSchema = Query(...)):
    """
    List products with filtering and pagination.

    Query Parameters:
    - category: Filter by category slug
    - origin: Filter by origin slug
    - fermentation_min/max: Filter by fermentation level
    - season: Filter by harvest season (spring, summer, autumn, winter)
    - price_min/max: Filter by price range (SGD)
    - in_stock: Filter by availability
    """
    queryset = Product.objects.filter(is_available=True).select_related(
        "category", "origin"
    )

    # Apply filters
    if filters.category:
        queryset = queryset.filter(category__slug=filters.category)

    if filters.origin:
        queryset = queryset.filter(origin__slug=filters.origin)

    if filters.fermentation_min is not None:
        queryset = queryset.filter(
            category__fermentation_level__gte=filters.fermentation_min
        )

    if filters.fermentation_max is not None:
        queryset = queryset.filter(
            category__fermentation_level__lte=filters.fermentation_max
        )

    if filters.season:
        queryset = queryset.filter(harvest_season=filters.season)

    if filters.price_min is not None:
        queryset = queryset.filter(price_sgd__gte=filters.price_min)

    if filters.price_max is not None:
        queryset = queryset.filter(price_sgd__lte=filters.price_max)

    if filters.in_stock:
        queryset = queryset.filter(stock__gt=0)

    return list(queryset)


@router.get("/{slug}/", response=ProductDetailSchema)
def get_product_detail(request, slug: str):
    """
    Get full product details by slug.
    Includes brewing guide and related products.
    """
    try:
        product = Product.objects.select_related("category", "origin").get(
            slug=slug, is_available=True
        )
    except Product.DoesNotExist:
        from ninja.errors import HttpError

        raise HttpError(404, "Product not found")

    # Get related products (same category, excluding current)
    related = Product.objects.filter(
        category=product.category, is_available=True
    ).exclude(id=product.id)[:4]

    # Build response
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "short_description": product.short_description,
        "price_sgd": product.price_sgd,
        "price_with_gst": product.get_price_with_gst(),
        "gst_amount": product.get_gst_amount(),
        "currency": "SGD",
        "weight_grams": product.weight_grams,
        "weight_display": product.get_weight_display(),
        "stock": product.stock,
        "is_in_stock": product.is_in_stock(),
        "is_new_arrival": product.is_new_arrival,
        "harvest_season": product.harvest_season,
        "harvest_year": product.harvest_year,
        "category": {
            "id": product.category.id,
            "name": product.category.name,
            "slug": product.category.slug,
            "fermentation_level": product.category.fermentation_level,
            "description": product.category.description,
            "brewing_temp_celsius": product.category.brewing_temp_celsius,
            "brewing_time_seconds": product.category.brewing_time_seconds,
        },
        "origin": {
            "id": product.origin.id,
            "name": product.origin.name,
            "slug": product.origin.slug,
            "region": product.origin.region,
            "description": product.origin.description,
            "image": product.origin.image,
        },
        "brewing_guide": {
            "temperature_celsius": product.category.brewing_temp_celsius,
            "time_seconds": product.category.brewing_time_seconds,
            "time_display": product.category.get_brewing_time_display(),
        },
        "image": product.image,
        "images": product.images,
        "related_products": [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "short_description": p.short_description,
                "price_sgd": p.price_sgd,
                "price_with_gst": p.get_price_with_gst(),
                "gst_amount": p.get_gst_amount(),
                "currency": "SGD",
                "weight_grams": p.weight_grams,
                "weight_display": p.get_weight_display(),
                "is_in_stock": p.is_in_stock(),
                "is_new_arrival": p.is_new_arrival,
                "harvest_season": p.harvest_season,
                "harvest_year": p.harvest_year,
                "category": {
                    "id": p.category.id,
                    "name": p.category.name,
                    "slug": p.category.slug,
                    "fermentation_level": p.category.fermentation_level,
                    "description": p.category.description,
                    "brewing_temp_celsius": p.category.brewing_temp_celsius,
                    "brewing_time_seconds": p.category.brewing_time_seconds,
                },
                "origin": {
                    "id": p.origin.id,
                    "name": p.origin.name,
                    "slug": p.origin.slug,
                    "region": p.origin.region,
                    "description": p.origin.description,
                    "image": p.origin.image,
                },
                "image": p.image,
            }
            for p in related
        ],
    }


@router.get("/categories/", response=List[CategoryListSchema])
def list_categories(request):
    """
    List all tea categories with product counts.
    """
    categories = TeaCategory.objects.annotate(
        product_count=models.Count(
            "products", filter=models.Q(products__is_available=True)
        )
    )

    return [
        {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "product_count": cat.product_count,
        }
        for cat in categories
    ]


@router.get("/categories/{slug}/", response=CategorySchema)
def get_category_detail(request, slug: str):
    """
    Get category details by slug.
    """
    try:
        category = TeaCategory.objects.get(slug=slug)
    except TeaCategory.DoesNotExist:
        from ninja.errors import HttpError

        raise HttpError(404, "Category not found")

    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "fermentation_level": category.fermentation_level,
        "description": category.description,
        "brewing_temp_celsius": category.brewing_temp_celsius,
        "brewing_time_seconds": category.brewing_time_seconds,
    }


@router.get("/origins/", response=List[OriginListSchema])
def list_origins(request):
    """
    List all origins with product counts.
    """
    origins = Origin.objects.annotate(
        product_count=models.Count(
            "products", filter=models.Q(products__is_available=True)
        )
    )

    return [
        {
            "id": origin.id,
            "name": origin.name,
            "slug": origin.slug,
            "region": origin.region,
            "description": origin.description,
            "image": origin.image,
            "product_count": origin.product_count,
        }
        for origin in origins
    ]


@router.get("/origins/{slug}/", response=OriginSchema)
def get_origin_detail(request, slug: str):
    """
    Get origin details by slug.
    """
    try:
        origin = Origin.objects.get(slug=slug)
    except Origin.DoesNotExist:
        from ninja.errors import HttpError

        raise HttpError(404, "Origin not found")

    return {
        "id": origin.id,
        "name": origin.name,
        "slug": origin.slug,
        "region": origin.region,
        "description": origin.description,
        "image": origin.image,
    }
