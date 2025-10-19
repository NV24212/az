CATEGORIES_SCHEMA = {
    "name": "categories",
    "type": "base",
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''", # Changed from None
    "schema": [
        {
            "name": "name",
            "type": "text",
            "required": True,
            "unique": True,
        }
    ]
}

PRODUCTS_SCHEMA = {
    "name": "products",
    "type": "base",
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''", # Changed from None
    "schema": [
        {
            "name": "name",
            "type": "text",
            "required": True,
        },
        {
            "name": "description",
            "type": "text",
        },
        {
            "name": "price",
            "type": "number",
            "required": True,
        },
        {
            "name": "stockQuantity",
            "type": "number",
            "required": True,
        },
        {
            "name": "imageUrl",
            "type": "text",
        },
        {
            "name": "categoryId",
            "type": "relation",
            "required": True,
            "options": {
                "collectionId": "categories",
                "cascadeDelete": False,
                "maxSelect": 1,
            }
        }
    ]
}
