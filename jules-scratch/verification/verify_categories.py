from playwright.sync_api import Page, expect

def test_category_filtering(page: Page):
    """
    This test verifies that the category filtering on the storefront works correctly.
    """
    # 1. Arrange: Go to the storefront homepage.
    page.goto("http://localhost:5173")

    # 2. Assert: Wait for the categories to load.
    expect(page.get_by_role("button", name="Electronics")).to_be_visible(timeout=10000)

    # 3. Act: Click on the "Electronics" category.
    page.get_by_role("button", name="Electronics").click()

    # 4. Assert: Wait for the products to filter.
    expect(page.get_by_role("progressbar")).not_to_be_visible(timeout=10000)

    # 5. Screenshot: Capture the filtered products.
    page.screenshot(path="jules-scratch/verification/filtered-products.png")

    # 6. Act: Click on the "All Products" category.
    page.get_by_role("button", name="All Products").click()

    # 7. Assert: Wait for the products to load.
    expect(page.get_by_role("progressbar")).not_to_be_visible(timeout=10000)

    # 8. Screenshot: Capture all the products.
    page.screenshot(path="jules-scratch/verification/all-products.png")

def test_admin_categories_page(page: Page):
    """
    This test verifies that the admin categories page loads correctly.
    """
    # 1. Arrange: Go to the admin login page.
    page.goto("http://localhost:5173/admin/login")

    # 2. Act: Log in.
    page.get_by_label("Email").fill("admin@azhar.com")
    page.get_by_label("Password").fill("azhar123")
    page.get_by_role("button", name="Login").click()

    # 3. Assert: Wait for the dashboard to load.
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=10000)

    # 4. Act: Click on the "Categories" link.
    page.get_by_role("link", name="Categories").click()

    # 5. Assert: Wait for the categories page to load.
    expect(page.get_by_role("heading", name="Categories")).to_be_visible(timeout=10000)

    # 6. Screenshot: Capture the categories page.
    page.screenshot(path="jules-scratch/verification/admin-categories.png")