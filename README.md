# Sangu Time - Daily Catering Platform Backend

A comprehensive Node.js backend for a daily catering platform that connects customers with local restaurants for multi-day meal ordering.

## 🚀 Features

### Customer Features
- User registration and authentication
- Browse restaurants by city
- Multi-day meal ordering with cart functionality
- Order history and tracking
- Payment via wallet system
- Rating and review system
- Real-time notifications

### Merchant (Restaurant Owner) Features
- Restaurant registration and management
- Menu creation and scheduling
- Daily menu management (Monday-Sunday)
- Order management and status updates
- Restaurant wallet and fund management
- Delivery confirmation

### Admin Features
- Dashboard with statistics
- User and restaurant management
- Restaurant verification
- Financial management (wallet operations)
- Support chat system
- Order management and cancellation
- Review moderation

## 📋 System Requirements

- Node.js >= 16.0.0
- MySQL >= 5.7.0 or MariaDB >= 10.2.0
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sangu-time-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment example file and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_NAME=sangu_time_dev
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Payment Gateway Configuration (Optional)
XENDIT_SECRET_KEY=your_xendit_secret_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
```

### 4. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE sangu_time_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. The application will automatically create tables on first run (in development mode).

For production, use Sequelize migrations:

```bash
# Run migrations
npm run migrate

# To undo migrations
npm run migrate:undo
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot reload enabled.

### Production Mode

```bash
npm start
```

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Run database seeders
- `npm run migrate:undo` - Undo last migration
- `npm run migrate:undo:all` - Undo all migrations

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phoneNumber": "+1234567890",
  "city": "New York",
  "role": "customer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phoneNumber": "+1234567891"
}
```

### Restaurant Endpoints

#### Create Restaurant (Merchant only)
```http
POST /restaurants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Restaurant Name",
  "fullAddress": "123 Main St, New York, NY 10001",
  "city": "New York",
  "description": "Delicious food description",
  "photo": "https://example.com/photo.jpg"
}
```

#### Get Restaurants
```http
GET /restaurants?page=1&limit=20&city=New York
```

#### Get My Restaurants (Merchant only)
```http
GET /restaurants/my/restaurants
Authorization: Bearer <token>
```

### Menu Endpoints

#### Create Menu (Merchant only)
```http
POST /menus
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": 1,
  "name": "Special Dish",
  "price": 15.99,
  "description": "Delicious special dish",
  "photo": "https://example.com/dish.jpg"
}
```

#### Get Restaurant Menus
```http
GET /menus/restaurant/1?dayOfWeek=monday
```

#### Schedule Daily Menu (Merchant only)
```http
POST /menus/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "menuId": 1,
  "dayOfWeek": "monday"
}
```

### Order Endpoints

#### Create Order (Customer only)
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "deliveryDate": "2024-01-15"
    }
  ]
}
```

#### Get My Orders (Customer only)
```http
GET /orders/my?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Restaurant Orders (Merchant only)
```http
GET /orders/restaurant/1?page=1&limit=20
Authorization: Bearer <token>
```

#### Update Daily Order Status (Merchant/Admin only)
```http
PUT /orders/daily/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Notification Endpoints

#### Get Notifications
```http
GET /notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PUT /notifications/1/read
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /notifications/unread/count
Authorization: Bearer <token>
```

### Review Endpoints

#### Create Review (Customer only)
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "dailyOrderId": 1,
  "rating": 5,
  "review": "Excellent food and service!"
}
```

#### Get Restaurant Reviews
```http
GET /reviews/restaurant/1?page=1&limit=20
```

### Admin Endpoints (Admin only)

#### Get Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer <admin-token>
```

#### Get Users
```http
GET /admin/users?page=1&limit=20&role=customer
Authorization: Bearer <admin-token>
```

#### Manage User Wallet
```http
POST /admin/wallets/users/1/manage
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "topup",
  "amount": 100.00,
  "description": "Manual top-up for testing"
}
```

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User accounts and authentication
- **user_wallets** - Customer wallet balances
- **restaurants** - Restaurant information and verification status
- **restaurant_wallets** - Restaurant wallet balances
- **menus** - Restaurant menu items
- **daily_menus** - Menu scheduling (pivot table)
- **orders** - Master order records
- **daily_orders** - Daily delivery orders
- **daily_order_items** - Items within daily orders
- **reviews** - Customer ratings and reviews
- **wallet_transactions** - All wallet transactions
- **admin_chats** - Support chat sessions
- **admin_chat_messages** - Chat messages
- **notifications** - In-app notifications

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_NAME` | Database name | `sangu_time_dev` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | (empty) |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Request rate limiting
- CORS configuration
- Input validation with Joi
- SQL injection prevention with Sequelize ORM
- Helmet.js for security headers

## 🚨 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

For validation errors:
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📝 Logging

The application includes:
- Request logging middleware
- Error logging to console
- Database query logging (in development)

## 🚀 Deployment

### Production Considerations

1. Set `NODE_ENV=production`
2. Use a proper database with connection pooling
3. Configure proper CORS origins
4. Use strong JWT secrets
5. Set up proper logging
6. Use HTTPS
7. Configure reverse proxy (nginx/Apache)
8. Set up monitoring and alerting

### Using PM2 for Production

```bash
npm install -g pm2
pm2 start src/app.js --name "sangu-time-backend"
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core catering platform features