
import asyncio
from playwright.async_api import async_playwright, Page, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("http://localhost:4173/admin/login")

        # Enter the password
        await page.get_by_label("Password").fill("azhar123")

        # Click the login button
        await page.get_by_role("button", name="Login").click()

        # Wait for the dashboard to load and assert that the header is not visible
        await expect(page.get_by_role("heading", name="لوحة التحكم")).to_be_visible()
        await expect(page.get_by_role("banner")).not_to_be_visible()

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/admin_panel_fixed.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
