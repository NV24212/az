from playwright.sync_api import Page, expect

def test_storefront_loads_and_displays_products(page: Page):
    """
    This test verifies that the storefront page loads correctly,
    displays a loading indicator, and then shows the products.
    """
    # 1. Arrange: Go to the storefront homepage.
    page.goto("http://localhost:5173")

    # 2. Assert: Confirm the loading indicator is visible initially.
    expect(page.get_by_role("progressbar")).to_be_visible()

    # 3. Assert: Wait for the products to load and the loading indicator to disappear.
    expect(page.get_by_role("progressbar")).not_to_be_visible(timeout=10000)

    # 4. Assert: Confirm the product grid is visible.
    expect(page.get_by_text("All Products")).to_be_visible()

    # 5. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")