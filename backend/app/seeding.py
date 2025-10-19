import structlog
from app.pocketbase_client import PocketBaseClient

logger = structlog.get_logger(__name__)

async def seed_database(pb_client: PocketBaseClient):
    """
    Checks if the database is empty and, if so, populates it with
    sample categories and products.
    """
    try:
        # Check if categories are empty
        existing_categories = await pb_client.get_full_list("categories")
        if not existing_categories:
            logger.info("No categories found. Seeding database with sample data...")

            # Create sample categories
            electronics = await pb_client.create_record("categories", {"name": "Electronics"})
            clothing = await pb_client.create_record("categories", {"name": "Clothing"})
            books = await pb_client.create_record("categories", {"name": "Books"})

            # Create sample products
            await pb_client.create_record("products", {
                "name": "Laptop",
                "description": "A powerful and portable laptop.",
                "price": 1200.00,
                "stockQuantity": 50,
                "imageUrl": "https://example.com/laptop.jpg",
                "categoryId": electronics['id']
            })
            await pb_client.create_record("products", {
                "name": "T-Shirt",
                "description": "A comfortable cotton t-shirt.",
                "price": 25.00,
                "stockQuantity": 200,
                "imageUrl": "https://example.com/tshirt.jpg",
                "categoryId": clothing['id']
            })
            await pb_client.create_record("products", {
                "name": "Programming Book",
                "description": "A book about programming.",
                "price": 50.00,
                "stockQuantity": 100,
                "imageUrl": "https://example.com/book.jpg",
                "categoryId": books['id']
            })
            logger.info("Database seeding complete.")
        else:
            logger.info("Database already contains data. Skipping seeding.")

    except Exception as e:
        logger.error("An error occurred during database seeding.", error=str(e))
