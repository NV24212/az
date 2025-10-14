
import asyncio
from playwright.async_api import async_playwright, Page, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("http://localhost:4173/admin/login")

        # Log in
        await page.get_by_label("Password").fill("azhar123")
        await page.get_by_role("button", name="Login").click()

        # Wait for navigation to the admin dashboard to complete
        await page.wait_for_url("http://localhost:4173/admin")

        # Navigate to products page
        await page.goto("http://localhost:4173/admin/products")
        await expect(page.get_by_role("heading", name="المنتجات")).to_be_visible()

        # Click "Add Product"
        await page.get_by_role("button", name="إضافة منتج").click()

        # Wait for the modal to be visible
        await expect(page.get_by_role("heading", name="إضافة منتج")).to_be_visible()

        # Fill out product details
        await page.get_by_label("اسم المنتج").fill("Test Product - Dashboard Style")
        await page.get_by_label("السعر").fill("120")

        # Add variants
        add_variant_button = page.get_by_role("button", name="إضافة", exact=True)
        await page.get_by_placeholder("اسم المتغير (مثال: أحمر، مقاس L)").fill("Green")
        await add_variant_button.click()
        await page.get_by_placeholder("اسم المتغير (مثال: أحمر، مقاس L)").fill("Yellow")
        await add_variant_button.click()

        # Fill in variant stock
        await page.locator('input[value="Green"]').locator('xpath=./following-sibling::input').fill('30')
        await page.locator('input[value="Yellow"]').locator('xpath=./following-sibling::input').fill('40')

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/final_product_modal.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
