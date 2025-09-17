import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_product_page(page: Page):
    """
    This test verifies that an admin can log in and view the product management page.
    """
    # 1. Arrange: Go to the admin login page.
    page.goto("http://localhost:5173/admin/login")

    # 2. Act: Log in as admin.
    # Use the default password from the .env.example file.
    page.get_by_label("Password").fill("your_super_secret_password")
    page.get_by_role("button", name="Login").click()

    # 3. Assert: Verify navigation to the admin dashboard and then to the products page.
    # Expect the main dashboard heading to be visible first.
    expect(page.get_by_role("heading", name="Admin Dashboard")).to_be_visible()

    # 4. Act: Navigate to the Products page.
    page.get_by_role("link", name="Products").click()

    # 5. Assert: Verify the products page is loaded.
    # Expect the heading for the product management page to be visible.
    expect(page.get_by_role("heading", name="Product Management")).to_be_visible()
    # Expect the table to be visible, indicating data has loaded.
    expect(page.get_by_role("table")).to_be_visible()
    # In a real test with a live DB, we would check for specific data.
    # Here, we just verify the table headers are present.
    expect(page.get_by_role("columnheader", name="Name")).to_be_visible()
    expect(page.get_by_role("columnheader", name="Category")).to_be_visible()

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_product_page(page)
        browser.close()

if __name__ == "__main__":
    main()
