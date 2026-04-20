"""
API Contract Tests for Products API - TDD Approach

These tests define the expected behavior of the product endpoints
before implementation. All tests should initially fail (RED phase).
"""

import pytest
from decimal import Decimal


@pytest.fixture
def sample_origin(db):
    """Create a sample origin."""
    from apps.commerce.models import Origin

    return Origin.objects.create(
        name="Yunnan",
        slug="yunnan",
        region="China",
        description="Misty mountains of Yunnan",
    )


@pytest.fixture
def sample_category(db):
    """Create a sample tea category."""
    from apps.commerce.models import TeaCategory

    return TeaCategory.objects.create(
        name="Pu'erh",
        slug="puerh",
        fermentation_level=-1,
        description="Post-fermented tea",
        brewing_temp_celsius=100,
        brewing_time_seconds=180,
    )


@pytest.fixture
def sample_product(db, sample_origin, sample_category):
    """Create a sample product."""
    from apps.commerce.models import Product

    return Product.objects.create(
        name="Yunnan Pu'erh 2019",
        slug="yunnan-puerh-2019",
        description="Earthy depth from ancient tea trees",
        short_description="2019 vintage Pu'erh",
        price_sgd=Decimal("48.00"),
        gst_inclusive=True,
        stock=50,
        is_available=True,
        origin=sample_origin,
        category=sample_category,
        harvest_season="spring",
        harvest_year=2019,
        weight_grams=50,
    )


@pytest.fixture
def api_client():
    """Return API test client."""
    from ninja.testing import TestClient
    from apps.api.v1.products import router

    return TestClient(router)


class TestProductListEndpoint:
    """Tests for GET /api/v1/products/"""

    def test_list_products_returns_200(self, api_client, sample_product):
        """GET /products/ should return 200 with list of products."""
        response = api_client.get("/products/")
        assert response.status_code == 200
        assert "items" in response.json()
        assert len(response.json()["items"]) >= 1

    def test_list_products_pagination(self, api_client, sample_product):
        """Should support pagination with page and page_size params."""
        response = api_client.get("/products/?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data

    def test_list_products_filter_by_category(self, api_client, sample_product):
        """Should filter products by category slug."""
        response = api_client.get(f"/products/?category={sample_product.category.slug}")
        assert response.status_code == 200
        items = response.json()["items"]
        assert all(
            item["category"]["slug"] == sample_product.category.slug for item in items
        )

    def test_list_products_filter_by_origin(self, api_client, sample_product):
        """Should filter products by origin slug."""
        response = api_client.get(f"/products/?origin={sample_product.origin.slug}")
        assert response.status_code == 200
        items = response.json()["items"]
        assert all(
            item["origin"]["slug"] == sample_product.origin.slug for item in items
        )

    def test_list_products_filter_by_season(self, api_client, sample_product):
        """Should filter products by harvest season."""
        response = api_client.get("/products/?season=spring")
        assert response.status_code == 200
        items = response.json()["items"]
        assert all(item["harvest_season"] == "spring" for item in items)

    def test_list_products_filter_by_price_range(self, api_client, sample_product):
        """Should filter products by price range."""
        response = api_client.get("/products/?price_min=40&price_max=50")
        assert response.status_code == 200
        items = response.json()["items"]
        assert all(40 <= Decimal(str(item["price_sgd"])) <= 50 for item in items)

    def test_list_products_filter_in_stock(self, api_client, sample_product):
        """Should filter products by stock availability."""
        response = api_client.get("/products/?in_stock=true")
        assert response.status_code == 200
        items = response.json()["items"]
        assert all(item["is_in_stock"] is True for item in items)

    def test_list_products_includes_pricing_info(self, api_client, sample_product):
        """Should include SGD pricing with GST."""
        response = api_client.get("/products/")
        assert response.status_code == 200
        product = response.json()["items"][0]
        assert "price_sgd" in product
        assert "price_with_gst" in product
        assert "gst_amount" in product
        assert product["currency"] == "SGD"


class TestProductDetailEndpoint:
    """Tests for GET /api/v1/products/{slug}/"""

    def test_get_product_detail_by_slug(self, api_client, sample_product):
        """GET /products/{slug}/ should return full product details."""
        response = api_client.get(f"/products/{sample_product.slug}/")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == sample_product.slug
        assert data["name"] == sample_product.name
        assert data["description"] == sample_product.description

    def test_get_product_detail_404_for_invalid_slug(self, api_client):
        """Should return 404 for non-existent product."""
        response = api_client.get("/products/non-existent-slug/")
        assert response.status_code == 404

    def test_get_product_detail_includes_brewing_guide(
        self, api_client, sample_product
    ):
        """Should include brewing guide from category."""
        response = api_client.get(f"/products/{sample_product.slug}/")
        assert response.status_code == 200
        data = response.json()
        assert "brewing_guide" in data
        assert "temperature_celsius" in data["brewing_guide"]
        assert "time_seconds" in data["brewing_guide"]

    def test_get_product_detail_includes_category_info(
        self, api_client, sample_product
    ):
        """Should include full category information."""
        response = api_client.get(f"/products/{sample_product.slug}/")
        assert response.status_code == 200
        data = response.json()
        assert "category" in data
        assert data["category"]["slug"] == sample_product.category.slug
        assert data["category"]["name"] == sample_product.category.name
        assert "fermentation_level" in data["category"]

    def test_get_product_detail_includes_origin_info(self, api_client, sample_product):
        """Should include full origin information."""
        response = api_client.get(f"/products/{sample_product.slug}/")
        assert response.status_code == 200
        data = response.json()
        assert "origin" in data
        assert data["origin"]["slug"] == sample_product.origin.slug
        assert data["origin"]["name"] == sample_product.origin.name

    def test_get_product_detail_includes_related_products(
        self, api_client, sample_product
    ):
        """Should include related products from same category."""
        response = api_client.get(f"/products/{sample_product.slug}/")
        assert response.status_code == 200
        data = response.json()
        assert "related_products" in data
        assert isinstance(data["related_products"], list)


class TestCategoriesEndpoint:
    """Tests for GET /api/v1/categories/"""

    def test_list_categories_returns_all(self, api_client, sample_category):
        """GET /categories/ should return all categories."""
        response = api_client.get("/categories/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 1

    def test_list_categories_includes_product_count(
        self, api_client, sample_category, sample_product
    ):
        """Should include product count per category."""
        response = api_client.get("/categories/")
        assert response.status_code == 200
        category = [c for c in response.json() if c["slug"] == sample_category.slug][0]
        assert "product_count" in category
        assert category["product_count"] >= 1


class TestOriginsEndpoint:
    """Tests for GET /api/v1/origins/"""

    def test_list_origins_returns_regions(self, api_client, sample_origin):
        """GET /origins/ should return all origins with regions."""
        response = api_client.get("/origins/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "region" in data[0]

    def test_list_origins_includes_tea_count(
        self, api_client, sample_origin, sample_product
    ):
        """Should include tea count per origin."""
        response = api_client.get("/origins/")
        assert response.status_code == 200
        origin = [o for o in response.json() if o["slug"] == sample_origin.slug][0]
        assert "product_count" in origin
        assert origin["product_count"] >= 1
