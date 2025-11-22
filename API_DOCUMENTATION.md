# API Documentation

## Base URL
```
http://localhost:3002/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { /* response data */ },
  "totalItems": 100,
  "totalPages": 10,
  "currentPage": 1
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": { /* error details */ }
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Required Fields:**
- `name` (string, 3-100 chars) - User's full name
- `email` (string, valid email) - User's email address
- `password` (string, min 8 chars) - User's password
- `phone_number` (string, 10-15 chars) - User's phone number
- `role` (string, enum) - User role: `customer`, `restaurant_owner`, or `admin`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    }
  }
}
```

### 2. Login User
**POST** `/auth/login`

Authenticate user and return JWT tokens.

**Required Fields:**
- `email` (string, valid email) - User's email
- `password` (string) - User's password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    }
  }
}
```

### 3. Refresh Token
**POST** `/auth/refresh`

Generate new access token using refresh token.

**Required Fields:**
- `refreshToken` (string) - Valid refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### 4. Logout User
**POST** `/auth/logout`

Logout user and invalidate refresh token.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Restaurant Endpoints

### 1. Get All Restaurants
**GET** `/restaurants`

Retrieve a paginated list of restaurants with optional filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search by name or description
- `cuisine` (string) - Filter by cuisine type
- `rating` (number) - Minimum rating filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "description": "Best pizza in town",
      "cuisine": "Italian",
      "address": "123 Main St",
      "phone": "+1234567890",
      "email": "info@pizzapalace.com",
      "rating": 4.5,
      "deliveryTime": "30-45 min",
      "deliveryFee": 2.99,
      "minOrder": 15.00,
      "image": "http://example.com/image.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalItems": 50,
  "totalPages": 5,
  "currentPage": 1
}
```

### 2. Get Restaurant by ID
**GET** `/restaurants/:id`

Retrieve detailed information about a specific restaurant.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "cuisine": "Italian",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "info@pizzapalace.com",
    "rating": 4.5,
    "deliveryTime": "30-45 min",
    "deliveryFee": 2.99,
    "minOrder": 15.00,
    "image": "http://example.com/image.jpg",
    "isActive": true,
    "menuItems": [
      {
        "id": 1,
        "name": "Margherita Pizza",
        "description": "Fresh tomatoes, mozzarella, basil",
        "price": 12.99,
        "category": "Pizza",
        "image": "http://example.com/pizza.jpg",
        "isAvailable": true
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Create Restaurant
**POST** `/restaurants`

Create a new restaurant (requires restaurant_owner or admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Required Fields:**
- `name` (string, 3-100 chars) - Restaurant name
- `description` (string, max 1000 chars) - Restaurant description
- `cuisine` (string) - Type of cuisine
- `address` (string) - Restaurant address
- `phone` (string) - Contact phone
- `email` (string, valid email) - Contact email

**Optional Fields:**
- `deliveryTime` (string) - Average delivery time
- `deliveryFee` (number) - Delivery fee amount
- `minOrder` (number) - Minimum order amount
- `image` (file) - Restaurant image

**Request Body:**
```json
{
  "name": "Pizza Palace",
  "description": "Best pizza in town",
  "cuisine": "Italian",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "info@pizzapalace.com",
  "deliveryTime": "30-45 min",
  "deliveryFee": 2.99,
  "minOrder": 15.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant created successfully",
  "data": {
    "id": 1,
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "cuisine": "Italian",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "info@pizzapalace.com",
    "deliveryTime": "30-45 min",
    "deliveryFee": 2.99,
    "minOrder": 15.00,
    "rating": 0,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Restaurant
**PUT** `/restaurants/:id`

Update restaurant information (requires owner or admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:** Same as create restaurant (all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Restaurant updated successfully",
  "data": {
    // Updated restaurant object
  }
}
```

### 5. Delete Restaurant
**DELETE** `/restaurants/:id`

Delete a restaurant (requires owner or admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Restaurant deleted successfully"
}
```

---

## Menu Items Endpoints

### 1. Get Menu Items by Restaurant
**GET** `/restaurants/:restaurantId/menu`

Get all menu items for a specific restaurant.

**Query Parameters:**
- `category` (string) - Filter by category
- `available` (boolean) - Show only available items

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "name": "Margherita Pizza",
      "description": "Fresh tomatoes, mozzarella, basil",
      "price": 12.99,
      "category": "Pizza",
      "image": "http://example.com/pizza.jpg",
      "isAvailable": true,
      "preparationTime": 15,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Create Menu Item
**POST** `/restaurants/:restaurantId/menu`

Add a new menu item (requires restaurant owner or admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Required Fields:**
- `name` (string, 3-100 chars) - Item name
- `price` (number, > 0) - Item price
- `category` (string) - Item category

**Optional Fields:**
- `description` (string) - Item description
- `image` (file) - Item image
- `preparationTime` (number) - Preparation time in minutes
- `isAvailable` (boolean) - Availability status

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Fresh tomatoes, mozzarella, basil",
  "price": 12.99,
  "category": "Pizza",
  "preparationTime": 15,
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": 1,
    "restaurantId": 1,
    "name": "Margherita Pizza",
    "description": "Fresh tomatoes, mozzarella, basil",
    "price": 12.99,
    "category": "Pizza",
    "image": null,
    "isAvailable": true,
    "preparationTime": 15,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update Menu Item
**PUT** `/menu-items/:id`

Update a menu item (requires restaurant owner or admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:** Same as create menu item (all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    // Updated menu item object
  }
}
```

### 4. Delete Menu Item
**DELETE** `/menu-items/:id`

Delete a menu item (requires restaurant owner or admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

---

## Order Endpoints

### 1. Create Order
**POST** `/orders`

Create a new order (requires customer role).

**Headers:**
- `Authorization: Bearer <token>`

**Required Fields:**
- `restaurantId` (number) - Restaurant ID
- `items` (array) - Order items
- `deliveryAddress` (object) - Delivery address

**Request Body:**
```json
{
  "restaurantId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "price": 12.99
    },
    {
      "menuItemId": 2,
      "quantity": 1,
      "price": 8.99
    }
  ],
  "deliveryAddress": {
    "street": "456 Customer St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "specialInstructions": "No onions please"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "restaurantId": 1,
    "status": "pending",
    "items": [
      {
        "id": 1,
        "menuItemId": 1,
        "quantity": 2,
        "price": 12.99,
        "menuItem": {
          "name": "Margherita Pizza"
        }
      }
    ],
    "totalAmount": 34.97,
    "deliveryFee": 2.99,
    "deliveryAddress": {
      "street": "456 Customer St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "specialInstructions": "No onions please",
    "estimatedDelivery": "2024-01-01T19:30:00.000Z",
    "createdAt": "2024-01-01T18:00:00.000Z"
  }
}
```

### 2. Get User Orders
**GET** `/orders`

Get orders for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by order status: `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "delivered",
      "totalAmount": 34.97,
      "deliveryFee": 2.99,
      "createdAt": "2024-01-01T18:00:00.000Z",
      "deliveredAt": "2024-01-01T19:45:00.000Z",
      "restaurant": {
        "id": 1,
        "name": "Pizza Palace"
      },
      "items": [
        {
          "name": "Margherita Pizza",
          "quantity": 2,
          "price": 12.99
        }
      ]
    }
  ],
  "totalItems": 25,
  "totalPages": 3,
  "currentPage": 1
}
```

### 3. Get Order by ID
**GET** `/orders/:id`

Get detailed information about a specific order.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "restaurantId": 1,
    "status": "delivered",
    "items": [/* order items with menu item details */],
    "totalAmount": 34.97,
    "deliveryFee": 2.99,
    "deliveryAddress": {/* delivery address details */},
    "specialInstructions": "No onions please",
    "estimatedDelivery": "2024-01-01T19:30:00.000Z",
    "createdAt": "2024-01-01T18:00:00.000Z",
    "confirmedAt": "2024-01-01T18:15:00.000Z",
    "preparedAt": "2024-01-01T19:00:00.000Z",
    "deliveredAt": "2024-01-01T19:45:00.000Z",
    "restaurant": {/* restaurant details */},
    "customer": {/* customer details */}
  }
}
```

### 4. Update Order Status
**PATCH** `/orders/:id/status`

Update order status (requires restaurant owner or admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Required Fields:**
- `status` (string) - New status: `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "status": "confirmed",
    "updatedAt": "2024-01-01T18:15:00.000Z"
  }
}
```

### 5. Cancel Order
**DELETE** `/orders/:id`

Cancel an order (requires customer role, only pending orders).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## Review Endpoints

### 1. Create Review
**POST** `/reviews`

Create a review for a restaurant (requires customer role).

**Headers:**
- `Authorization: Bearer <token>`

**Required Fields:**
- `restaurantId` (number) - Restaurant ID
- `orderId` (number) - Order ID (must be delivered)
- `rating` (number, 1-5) - Rating
- `comment` (string, max 1000 chars) - Review comment

**Request Body:**
```json
{
  "restaurantId": 1,
  "orderId": 1,
  "rating": 5,
  "comment": "Amazing pizza and great delivery service!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "restaurantId": 1,
    "orderId": 1,
    "rating": 5,
    "comment": "Amazing pizza and great delivery service!",
    "createdAt": "2024-01-01T20:00:00.000Z",
    "customer": {
      "name": "John Doe"
    }
  }
}
```

### 2. Get Restaurant Reviews
**GET** `/restaurants/:restaurantId/reviews`

Get all reviews for a specific restaurant.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `rating` (number) - Filter by minimum rating

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Amazing pizza and great delivery service!",
      "createdAt": "2024-01-01T20:00:00.000Z",
      "customer": {
        "name": "John Doe"
      },
      "order": {
        "id": 1,
        "createdAt": "2024-01-01T18:00:00.000Z"
      }
    }
  ],
  "totalItems": 15,
  "totalPages": 2,
  "currentPage": 1,
  "averageRating": 4.5
}
```

### 3. Update Review
**PUT** `/reviews/:id`

Update a review (requires review owner).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review: Good pizza but delivery was a bit late"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    // Updated review object
  }
}
```

### 4. Delete Review
**DELETE** `/reviews/:id`

Delete a review (requires review owner or admin).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Notification Endpoints

### 1. Get User Notifications
**GET** `/notifications`

Get notifications for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `read` (boolean) - Filter by read status
- `type` (string) - Filter by notification type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "type": "order_status",
      "title": "Order Confirmed",
      "message": "Your order #1 has been confirmed by the restaurant",
      "isRead": false,
      "createdAt": "2024-01-01T18:15:00.000Z",
      "metadata": {
        "orderId": 1
      }
    }
  ],
  "totalItems": 8,
  "totalPages": 1,
  "currentPage": 1,
  "unreadCount": 3
}
```

### 2. Mark Notification as Read
**PATCH** `/notifications/:id/read`

Mark a notification as read.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": 1,
    "isRead": true,
    "readAt": "2024-01-01T20:00:00.000Z"
  }
}
```

### 3. Mark All Notifications as Read
**PATCH** `/notifications/read-all`

Mark all notifications for the user as read.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Admin Endpoints

### 1. Get Dashboard Stats
**GET** `/admin/dashboard`

Get dashboard statistics (requires admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "totalRestaurants": 45,
    "totalOrders": 2500,
    "totalRevenue": 50000.00,
    "activeOrders": 25,
    "recentOrders": [/* recent order data */],
    "topRestaurants": [/* top restaurant data */],
    "monthlyRevenue": [
      { "month": "Jan", "revenue": 8000.00 },
      { "month": "Feb", "revenue": 9500.00 }
    ]
  }
}
```

### 2. Get All Users
**GET** `/admin/users`

Get all users in the system (requires admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `role` (string) - Filter by role
- `search` (string) - Search by name or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "customer",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalItems": 1500,
  "totalPages": 150,
  "currentPage": 1
}
```

### 3. Update User Status
**PATCH** `/admin/users/:id/status`

Update user active status (requires admin role).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

---

## File Upload Endpoints

### 1. Upload Image
**POST** `/upload/image`

Upload an image file.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `image` (file) - Image file (JPEG, PNG, WebP, max 5MB)
- `type` (string) - Image type: `restaurant`, `menu_item`, `profile`

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "image_1234567890.jpg",
    "originalName": "restaurant-photo.jpg",
    "path": "/uploads/images/restaurant/image_1234567890.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg"
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too many requests - Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Endpoints marked with rate limiting:** All `/api/` endpoints
- **Headers included:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Testing

Use these endpoints to test API connectivity:

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

### API Version
```http
GET /api/v1
```

**Response:**
```json
{
  "message": "Sangu Time API v1.0.0",
  "version": "1.0.0"
}
```

---

## Postman Collection

You can import the Postman collection from `postman_collection.json` to test all API endpoints with pre-configured environments.

---

## Support

For API support and questions:
- Email: support@sangu-time.com
- Documentation: https://docs.sangu-time.com
- Status Page: https://status.sangu-time.com