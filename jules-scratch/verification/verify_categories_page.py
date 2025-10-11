from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:4173/admin/login")
        page.wait_for_selector('input[name="password"]', state='visible')
        page.fill('input[name="password"]', "azhar123")
        page.click('button[type="submit"]')
        page.wait_for_url("http://localhost:4173/admin")
        page.click('a[href="/admin/categories"]')
        page.wait_for_url("http://localhost:4173/admin/categories")
        page.screenshot(path="jules-scratch/verification/categories_page.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
