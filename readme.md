# FoodExpress

<p align="center">
  <img src="./resources/foodExpress.png" alt="FoodExpress Logo" width="300" height="300">
</p>

**"Fast, Reliable, and Delicious – Delivered to Your Doorstep."**

FoodExpress is a premium food ordering platform that connects hungry customers with their favorite local providers. Built with a focus on speed, reliability, and a seamless user experience, FoodExpress is your go-to solution for satisfying every craving.

---

## Key Features

### For Customers

- **Intuitive Discovery**: Browse meals by category, cuisine, or restaurant.
- **Dynamic Cart**: Seamlessly add items, adjust quantities, and manage your order.
- **Live Tracking**: Real-time status updates from "Placed" to "Delivered".
- **Reviews & Ratings**: Share your dining experience with the community.

### For Restaurants

- **Menu Management**: Effortlessly add, edit, or remove meals.
- **Order Dashboard**: Manage incoming orders in real-time.
- **Status Control**: Keep customers updated with streamlined status transitions.

### For Admins

- **User Oversight**: Manage customer and provider statuses.
- **Category Control**: Organize the platform's menu hierarchy.
- **Analytics**: High-level overview of platform performance.

---

## Tech Stack

- **Framework**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)

---

## Database Schema

Our database is designed for high performance and data integrity:

```mermaid
erDiagram
    USER ||--o| PROVIDER_PROFILE : "has"
    USER ||--o{ ORDER : "places"
    USER ||--o{ REVIEW : "writes"
    PROVIDER_PROFILE ||--o{ MEAL : "offers"
    CATEGORY ||--o{ MEAL : "categorizes"
    MEAL ||--o{ ORDER_ITEM : "included in"
    ORDER ||--o{ ORDER_ITEM : "contains"
    MEAL ||--o{ REVIEW : "receives"

    USER {
        string id PK
        string email
        string role "CUSTOMER | PROVIDER | ADMIN"
        string status "ACTIVE | SUSPENDED"
    }
    PROVIDER_PROFILE {
        string id PK
        string name
        string location
    }
    MEAL {
        string id PK
        string name
        float price
    }
    ORDER {
        string id PK
        string status "PLACED | PREPARING | READY | DELIVERED"
        float totalPrice
    }
    ORDER_ITEM {
        string id PK
        int quantity
        float price "Snapshot"
    }
```

---

## Getting Started

### 1. Prerequisites

- Node.js (v18+)
- PostgreSQL Database

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/amisadman/food-express.git

# Install dependencies
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory: use `.env.example`.

### 4. Database Migration

```bash
pnpm dlx prisma migrate dev --name init
```

### 5. Run the Application

```bash
pnpm dev
```

---
