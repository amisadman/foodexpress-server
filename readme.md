# FoodExpress

<p align="center">
  <img src="./resources/foodExpress.png" alt="FoodExpress Logo" width="300" height="300">
</p>

**"Fast, Reliable, and Delicious – Delivered to Your Doorstep."**

FoodExpress is a premium food ordering platform that connects hungry customers with their favorite local providers. Built with a focus on speed, reliability, and a seamless user experience, FoodExpress is your go-to solution for satisfying every craving.

---
## Client Repository

The frontend client for this project is available at:
[https://github.com/amisadman/papertrail-client](https://github.com/amisadman/foodexpress-client)

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
    User ||--o| ProviderProfile : "may have"
    User ||--o{ Order : places
    User ||--o{ Review : writes
    
    ProviderProfile ||--o{ Meal : offers
    ProviderProfile ||--o{ Review : receives
    ProviderProfile ||--o{ Order : receives
    
    Category ||--o{ Meal : contains
    
    Meal ||--o{ OrderItem : "included in"
    Meal ||--o{ Review : "reviewed in"
    
    Order ||--o{ OrderItem : contains
    
    User {
        string id PK
        string name
        string email UK
        boolean emailVerified
        string image
        datetime createdAt
        datetime updatedAt
        Role role
        UserStatus status
        string phone
    }
    
    ProviderProfile {
        string id PK
        string name
        string location
        float longitude
        float latitude
        string description
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Category {
        string id PK
        string name UK
    }
    
    Meal {
        string id PK
        string name
        string description
        float price
        string image
        string providerId FK
        string catagoryId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Order {
        string id PK
        OrderStatus status
        string delivaryAddress
        float longitude
        float latitude
        float totalPrice
        string providerId FK
        string customerId FK
        datetime createdAt
        datetime updatedAt
    }
    
    OrderItem {
        string id PK
        int quantity
        float price
        string orderId FK
        string mealId FK
    }
    
    Review {
        string id PK
        float rating
        string comment
        string userId FK
        string mealId FK
        string providerId FK
        datetime createdAt
        datetime updatedAt
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
git clone https://github.com/amisadman/foodexpress-server.git

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
