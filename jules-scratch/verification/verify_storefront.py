from playwright.sync_api import Page, expect

def test_storefront_loads(page: Page):
    """
    This test verifies that the storefront page loads correctly and displays the products.
    """
    # 1. Arrange: Go to the storefront homepage.
    page.goto("http://localhost:5173")

    # 2. Assert: Confirm the header is visible.
    expect(page.get_by_role("banner")).to_be_visible()
    expect(page.get_by_role("link", name="AzharStore")).to_be_visible()

    # 3. Assert: Confirm the main content is visible.
    expect(page.get_by_role("main")).to_be_visible()

    # 4. Assert: Confirm the product grid is visible.
    expect(page.get_by_text("All Products")).to_be_visible()

    # 5. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")