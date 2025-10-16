from playwright.sync_api import Page, expect

def test_create_customer(page: Page):
    """
    This test attempts to create a customer from the admin panel.
    """
    # 1. Arrange: Go to the admin login page.
    page.goto("http://localhost:5173/admin/login")

    # 2. Act: Log in.
    page.get_by_label("Email").fill("admin@azhar.com")
    page.get_by_label("Password").fill("azhar123")
    page.get_by_role("button", name="Login").click()

    # 3. Assert: Wait for the dashboard to load.
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=10000)

    # 4. Act: Click on the "Customers" link.
    page.get_by_role("link", name="Customers").click()

    # 5. Assert: Wait for the customers page to load.
    expect(page.get_by_role("heading", name="Customers")).to_be_visible(timeout=10000)

    # 6. Act: Click on the "Add Customer" button.
    page.get_by_role("button", name="Add Customer").click()

    # 7. Assert: Wait for the modal to open.
    expect(page.get_by_role("heading", name="Add Customer")).to_be_visible(timeout=10000)

    # 8. Act: Fill out the form.
    page.get_by_label("Name").fill("John Doe")
    page.get_by_label("Phone").fill("1234567890")
    page.get_by_label("Address").fill("123 Main St")

    # 9. Act: Click the "Create Customer" button.
    page.get_by_role("button", name="Create Customer").click()

    # 10. Assert: Check for the new customer in the table.
    expect(page.get_by_text("John Doe")).to_be_visible(timeout=10000)