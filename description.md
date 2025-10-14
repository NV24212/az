# AzharStore: Technical and Architectural Overview

## 1. High-Level Architecture

AzharStore is a full-stack e-commerce application built with a modern, distributed architecture that separates the frontend and backend services. This separation enhances scalability, maintainability, and allows for independent development and deployment of each component.

The architecture consists of three main services:

- **Frontend Service (Cloudflare Workers):** The user-facing part of the application is a React application built with Vite. It is deployed on Cloudflare Workers, which allows the application to be served from Cloudflare's global edge network. This results in very fast load times for users worldwide. The frontend is responsible for rendering the user interface, handling user interactions, and communicating with the backend service via a REST API.

- **Backend Service (Dokploy):** The backend is a high-performance REST API built with FastAPI, a modern Python web framework. It is deployed on Dokploy, a platform that supports containerized applications using Docker. The backend service handles all business logic, data processing, and interactions with the database.

- **Database Service (Supabase):** The application uses Supabase as its database provider, which offers a managed PostgreSQL database. Supabase provides a scalable and reliable data storage solution, and the backend service communicates with it to store and retrieve data.

The communication between the frontend and backend services is done exclusively through a REST API over HTTPS. This ensures a clear separation of concerns and allows the two services to evolve independently.

## 2. Frontend Deep Dive

The frontend of AzharStore is a modern React application built with Vite, a fast and lightweight build tool. This section provides a detailed look into its architecture, styling, and key dependencies.

### Technology Stack

- **React:** The core of the frontend is built with React, a popular JavaScript library for building user interfaces.
- **Vite:** The application uses Vite as its build tool, which provides a fast development experience with features like Hot Module Replacement (HMR).
- **TypeScript:** The codebase is written in TypeScript, which adds static typing to JavaScript, improving code quality and maintainability.
- **Styling:** Styling is handled by **Tailwind CSS**, a utility-first CSS framework that allows for rapid UI development.
- **Internationalization (i18n):** The application supports multiple languages using **i18next** and **react-i18next**, with translation files stored in JSON format.

### Key Dependencies

The frontend relies on several key libraries to provide its functionality:

- **`@tanstack/react-query`:** Used for managing server state, including caching, data fetching, and optimistic updates.
- **`react-router-dom`:** Handles client-side routing, allowing for a single-page application (SPA) experience.
- **`zustand`:** A small, fast, and scalable state management library used for managing global client state.
- **`framer-motion`:** A powerful animation library for creating fluid and complex animations.
- **`recharts`:** A composable charting library for data visualization in the admin dashboard.
- **`lucide-react`:** Provides a set of beautiful and consistent icons.
- **`i18next` & `react-i18next`:** Manages the internationalization of the application, allowing for easy translation of text.

## 3. Backend Deep Dive

The backend of AzharStore is a REST API built with FastAPI, a modern, high-performance Python web framework. It is designed to be scalable, maintainable, and easy to develop.

### Technology Stack

- **FastAPI:** The core of the backend is built with FastAPI, which provides automatic data validation, interactive API documentation, and asynchronous request handling.
- **Pydantic:** Used for data validation and settings management, ensuring that the data flowing through the API is well-structured and type-safe.
- **SQLAlchemy:** The backend uses SQLAlchemy, a popular SQL toolkit and Object-Relational Mapper (ORM), to interact with the PostgreSQL database provided by Supabase.
- **Uvicorn:** The application is served by Uvicorn, a lightning-fast ASGI server, which is ideal for running asynchronous Python web applications.

### Key Dependencies

The backend relies on several key libraries to provide its functionality:

- **`fastapi`:** The main web framework for building the API.
- **`uvicorn`:** The ASGI server for running the application.
- **`pydantic`:** For data validation and settings management.
- **`SQLAlchemy`:** For interacting with the database.
- **`psycopg2-binary` & `asyncpg`:** PostgreSQL drivers for connecting to the Supabase database.
- **`python-jose` & `passlib`:** Used for handling JWT-based authentication and password hashing.
- **`bcrypt`:** A library for hashing passwords securely.

## 4. DevOps and Deployment

AzharStore uses a modern DevOps workflow with a CI/CD pipeline powered by GitHub Actions. This automated pipeline ensures that code changes are automatically tested and deployed, streamlining the development process and improving reliability.

### CI/CD Pipeline

The CI/CD pipeline is defined in a GitHub Actions workflow file. It is triggered on pushes to the main branches and automates the following steps:

1.  **Code Checkout:** The pipeline checks out the latest code from the repository.
2.  **Dependency Installation:** It installs the necessary dependencies for both the frontend and backend.
3.  **Linting and Testing:** The code is linted to ensure it adheres to the coding standards, and automated tests are run to verify its correctness.
4.  **Building:** The frontend and backend applications are built into production-ready artifacts.
5.  **Deployment:** The built artifacts are deployed to their respective platforms.

### Frontend Deployment

The frontend is deployed to **Cloudflare Workers**, a serverless platform that runs code on Cloudflare's global edge network. This has several advantages:

-   **Global Distribution:** The application is served from data centers close to the users, resulting in low latency and fast load times.
-   **Scalability:** Cloudflare Workers automatically scales to handle traffic spikes.
-   **Security:** The application benefits from Cloudflare's robust security features.

### Backend Deployment

The backend is deployed to **Dokploy**, a platform for deploying and managing containerized applications. The backend is packaged into a Docker container, which is then deployed to Dokploy. This approach offers:

-   **Containerization:** Docker ensures that the application runs in a consistent and isolated environment.
-   **Scalability:** Dokploy allows for easy scaling of the backend service to handle increased load.
-   **Managed Infrastructure:** Dokploy handles the underlying infrastructure, allowing developers to focus on building the application.

## 5. Key Features and Code Structure

This section outlines the core functionalities of the AzharStore application and provides an overview of how the code is organized.

### Key Features

-   **Admin Dashboard:** A comprehensive dashboard for managing products, orders, and customers.
-   **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for products.
-   **Order Management:** View and manage customer orders.
-   **Customer Management:** Manage customer information.
-   **Storefront:** A public-facing storefront for customers to browse and purchase products.
-   **Shopping Cart:** A fully functional shopping cart for customers to add products to.
-   **Guest Checkout:** A streamlined checkout process for guest users.

### Code Structure

The codebase is organized into two main directories: `frontend` and `backend`.

-   **`frontend`:** This directory contains the React application.
    -   `src/`: The main source code for the frontend.
        -   `components/`: Reusable React components.
        -   `pages/`: The main pages of the application.
        -   `lib/`: Utility functions and helper modules.
        -   `hooks/`: Custom React hooks.
        -   `locales/`: Translation files for i18n.
-   **`backend`:** This directory contains the FastAPI application.
    -   `app/`: The main source code for the backend.
        -   `api/`: API endpoint definitions.
        -   `models/`: Pydantic models for data validation.
        -   `db/`: Database connection and session management.
        -   `core/`: Core application logic and settings.
