from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the admin dashboard
    page.goto("http://localhost:3000/admin")
    page.screenshot(path="jules-scratch/verification/01_dashboard.png")

    # Navigate to Products page
    page.get_by_role("link", name="Products").click()
    page.wait_for_url("http://localhost:3000/admin/products")
    page.screenshot(path="jules-scratch/verification/02_products.png")

    # Navigate to Categories page
    page.get_by_role("link", name="Categories").click()
    page.wait_for_url("http://localhost:3000/admin/products/categories")
    page.screenshot(path="jules-scratch/verification/03_categories.png")

    # Navigate to Orders page
    page.get_by_role("link", name="Orders").click()
    page.wait_for_url("http://localhost:3000/admin/orders")
    page.screenshot(path="jules-scratch/verification/04_orders.png")

    # Navigate to Customers page
    page.get_by_role("link", name="Customers").click()
    page.wait_for_url("http://localhost:3000/admin/customers")
    page.screenshot(path="jules-scratch/verification/05_customers.png")

    # Navigate to Settings page
    page.get_by_role("link", name="Settings").click()
    page.wait_for_url("http://localhost:3000/admin/settings")
    page.screenshot(path="jules-scratch/verification/06_settings.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)