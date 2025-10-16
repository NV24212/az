from playwright.sync_api import Page, expect

def test_storefront_loading(page: Page):
    """
    This test verifies that the storefront page loads quickly and displays the skeleton loaders.
    """
    # 1. Arrange: Go to the storefront homepage.
    page.goto("http://localhost:5173")

    # 2. Assert: Confirm the skeleton loaders are visible initially.
    expect(page.get_by_role("article")).to_be_visible()

    # 3. Assert: Wait for the products to load.
    expect(page.get_by_role("heading", name="Elegant Summer Dress")).to_be_visible(timeout=10000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/storefront-loaded.png")

def test_admin_panel_loading(page: Page):
    """
    This test verifies that the admin panel pages load quickly and display the loading indicators.
    """
    # 1. Arrange: Go to the admin login page.
    page.goto("http://localhost:5173/admin/login")

    # 2. Act: Log in.
    page.get_by_label("Email").fill("admin@azhar.com")
    page.get_by_label("Password").fill("azhar123")
    page.get_by_role("button", name="Login").click()

    # 3. Assert: Wait for the dashboard to load.
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=10000)

    # 4. Act: Click on the "Products" link.
    page.get_by_role("link", name="Products").click()

    # 5. Assert: Wait for the products page to load.
    expect(page.get_by_role("heading", name="Products")).to_be_visible(timeout=10000)

    # 6. Screenshot: Capture the products page.
    page.screenshot(path="jules-scratch/verification/admin-products-loaded.png")