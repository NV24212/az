from playwright.sync_api import Page, expect

def test_order_management(page: Page):
    """
    This test verifies that the order management features in the admin panel work correctly.
    """
    # 1. Arrange: Go to the admin login page.
    page.goto("http://localhost:5173/admin/login")

    # 2. Act: Log in.
    page.get_by_label("Email").fill("admin@azhar.com")
    page.get_by_label("Password").fill("azhar123")
    page.get_by_role("button", name="Login").click()

    # 3. Assert: Wait for the dashboard to load.
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible(timeout=10000)

    # 4. Act: Click on the "Orders" link.
    page.get_by_role("link", name="Orders").click()

    # 5. Assert: Wait for the orders page to load.
    expect(page.get_by_role("heading", name="Orders")).to_be_visible(timeout=10000)

    # 6. Screenshot: Capture the orders page.
    page.screenshot(path="jules-scratch/verification/admin-orders.png")

    # 7. Act: Click on the "Add Order" button.
    page.get_by_role("button", name="Add Order").click()

    # 8. Assert: Wait for the modal to open.
    expect(page.get_by_role("heading", name="Create Order")).to_be_visible(timeout=10000)

    # 9. Screenshot: Capture the create order modal.
    page.screenshot(path="jules-scratch/verification/create-order-modal.png")

    # 10. Act: Close the modal.
    page.get_by_role("button", name="Cancel").click()

    # 11. Assert: Wait for the modal to close.
    expect(page.get_by_role("heading", name="Create Order")).not_to_be_visible(timeout=10000)

    # 12. Act: Change the status of the first order.
    page.locator("select").first.select_option("SHIPPED")

    # 13. Assert: Wait for the status to update.
    expect(page.get_by_role("option", name="SHIPPED")).to_be_visible(timeout=10000)

    # 14. Screenshot: Capture the updated status.
    page.screenshot(path="jules-scratch/verification/updated-order-status.png")