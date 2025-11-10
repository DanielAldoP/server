# PRD-2: Frontend Development Guide - Sangu Time Daily Catering Platform

## 1. Application Overview

**Sangu Time** is a daily catering platform that connects customers with local restaurants for recurring meal orders. The platform supports three user roles: Customers (who order food), Merchants (who own and manage restaurants), and Admins (who manage the platform).

### 1.1 Core Value Proposition
- **For Customers**: Easy ordering of daily/weekly meals from verified local restaurants with flexible scheduling and reliable delivery.
- **For Merchants**: Digital tools to manage restaurants, menus, orders, and finances with built-in customer base.
- **For Admins**: Comprehensive control panel for platform management, verification, support, and financial oversight.

### 1.2 Key Features
- Multi-restaurant daily ordering with cart functionality
- Weekly menu scheduling by restaurants
- Real-time order tracking and notifications
- Wallet system for payments and fund management
- Review and rating system
- Admin verification and support system
- Role-based dashboards and interfaces

## 2. Technical Architecture

### 2.1 Technology Stack
- **Frontend**: Vue.js 3 with Composition API
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Authentication**: JWT with localStorage
- **Form Validation**: Yup/Compose
- **UI Components**: Headless UI or Custom Components
- **Icons**: Heroicons or Lucide Vue

### 2.2 Project Structure
```
src/
├── components/
│   ├── common/          # Shared components
│   ├── auth/            # Authentication components
│   ├── customer/        # Customer-specific components
│   ├── merchant/        # Merchant-specific components
│   └── admin/           # Admin-specific components
├── views/
│   ├── auth/            # Authentication pages
│   ├── customer/        # Customer pages
│   ├── merchant/        # Merchant pages
│   └── admin/           # Admin pages
├── stores/              # Pinia stores
├── services/            # API services
├── utils/               # Utility functions
├── middleware/          # Route guards
├── composables/         # Vue composables
└── assets/              # Static assets
```

### 2.3 API Integration
- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: Bearer token in Authorization header
- **Response Format**: Consistent JSON with status, message, data, and timestamp
- **Error Handling**: Centralized error handling with user-friendly messages

## 3. API Endpoints Documentation

### 3.1 Authentication Endpoints

#### POST /auth/register
**Purpose**: Register new user (customer or merchant)
**Request Body**:
```json
{
  "name": "string (2-255 chars)",
  "email": "valid email",
  "password": "min 8 chars, uppercase, lowercase, number",
  "phone_number": "international format (+1234567890)",
  "city": "string (2-100 chars)",
  "role": "customer|merchant (optional, defaults to customer)"
}
```
**Response**:
```json
{
  "status": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "city": "New York",
    "role": "customer",
    "created_at": 1634567890
  }
}
```

#### POST /auth/login
**Purpose**: User authentication
**Request Body**:
```json
{
  "email": "valid email",
  "password": "string"
}
```
**Response**:
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "city": "New York"
    }
  }
}
```

#### GET /auth/profile
**Purpose**: Get current user profile
**Authentication**: Required
**Response**: User profile data

#### PUT /auth/profile
**Purpose**: Update user profile
**Authentication**: Required
**Request Body**: Partial update of name, phone_number, city

#### PUT /auth/change-password
**Purpose**: Change user password
**Authentication**: Required
**Request Body**:
```json
{
  "current_password": "string",
  "new_password": "min 8 chars, uppercase, lowercase, number"
}
```

### 3.2 Restaurant Endpoints

#### GET /restaurants
**Purpose**: Get all active restaurants with pagination
**Query Parameters**: page, limit, city
**Response**: Paginated restaurant list with basic info

#### GET /restaurants/:id
**Purpose**: Get restaurant details
**Authentication**: Required
**Response**: Full restaurant details with owner info

#### POST /restaurants
**Purpose**: Create new restaurant
**Authentication**: Merchant role required
**Request Body**:
```json
{
  "name": "string (2-255 chars)",
  "full_address": "string (10-500 chars)",
  "city": "string (2-100 chars)",
  "description": "string (optional, max 1000 chars)",
  "photo": "valid URL (optional)"
}
```

#### GET /restaurants/my/restaurants
**Purpose**: Get current merchant's restaurants
**Authentication**: Merchant role required

#### PUT /restaurants/:id
**Purpose**: Update restaurant
**Authentication**: Owner merchant or admin

#### PUT /restaurants/:id/verify
**Purpose**: Verify/reject restaurant
**Authentication**: Admin role required
**Request Body**:
```json
{
  "status": "active|rejected",
  "rejection_reason": "string (required if rejected)"
}
```

### 3.3 Menu Endpoints

#### GET /menu/restaurant/:restaurantId
**Purpose**: Get restaurant menu items
**Query Parameters**: page, limit, day_of_week
**Response**: Paginated menu items

#### GET /menu/schedule/:restaurantId
**Purpose**: Get restaurant's daily menu schedule
**Query Parameters**: day_of_week
**Response**: Daily menu schedule with menu details

#### POST /menu
**Purpose**: Create menu item
**Authentication**: Merchant role required
**Request Body**:
```json
{
  "restaurant_id": "integer",
  "name": "string (2-255 chars)",
  "price": "positive number (max 2 decimal places)",
  "description": "string (optional, max 1000 chars)",
  "photo": "valid URL (optional)"
}
```

#### PUT /menu/:id
**Purpose**: Update menu item
**Authentication**: Owner merchant or admin

#### DELETE /menu/:id
**Purpose**: Delete menu item
**Authentication**: Owner merchant or admin

#### POST /menu/schedule
**Purpose**: Create daily menu schedule
**Authentication**: Merchant role required
**Request Body**:
```json
{
  "menu_id": "integer",
  "day_of_week": "monday|tuesday|wednesday|thursday|friday|saturday|sunday"
}
```

#### DELETE /menu/schedule/:id
**Purpose**: Remove daily menu schedule
**Authentication**: Owner merchant or admin

### 3.4 Order Endpoints

#### POST /orders
**Purpose**: Create new order
**Authentication**: Customer role required
**Request Body**:
```json
{
  "items": [
    {
      "menu_id": "integer",
      "quantity": "positive integer",
      "delivery_date": "ISO date (YYYY-MM-DD), not past"
    }
  ]
}
```

#### GET /orders/my
**Purpose**: Get current customer's orders
**Authentication**: Customer role required
**Query Parameters**: page, limit, status

#### GET /orders/:id
**Purpose**: Get order details
**Authentication**: Required (owner or admin)

#### GET /orders/restaurant/:id
**Purpose**: Get restaurant's daily orders
**Authentication**: Merchant role required
**Query Parameters**: page, limit, status, delivery_date

#### PUT /orders/daily/:id/status
**Purpose**: Update daily order status
**Authentication**: Merchant or admin role required
**Request Body**:
```json
{
  "status": "pending|confirmed|delivered|cancelled"
}
```

#### PUT /orders/daily/:id/confirm-delivery
**Purpose**: Confirm delivery (merchant or customer)
**Authentication**: Required
**Request Body**:
```json
{
  "type": "merchant|customer"
}
```

#### GET /orders/admin/all
**Purpose**: Get all orders
**Authentication**: Admin role required

### 3.5 Review Endpoints

#### POST /reviews
**Purpose**: Create review
**Authentication**: Customer role required
**Request Body**:
```json
{
  "daily_order_id": "integer",
  "rating": "integer (1-5)",
  "review": "string (optional, max 1000 chars)"
}
```

#### GET /reviews/restaurant/:restaurantId
**Purpose**: Get restaurant reviews
**Query Parameters**: page, limit

#### GET /reviews/my
**Purpose**: Get current user's reviews
**Authentication**: Customer role required

#### PUT /reviews/:id
**Purpose**: Update review
**Authentication**: Review owner or admin

#### DELETE /reviews/:id
**Purpose**: Delete review
**Authentication**: Review owner or admin

### 3.6 Notification Endpoints

#### GET /notifications
**Purpose**: Get user notifications
**Authentication**: Required
**Query Parameters**: page, limit, unread_only

#### GET /notifications/unread/count
**Purpose**: Get unread notifications count
**Authentication**: Required

#### PUT /notifications/:id/read
**Purpose**: Mark notification as read
**Authentication**: Required

#### PUT /notifications/all/read
**Purpose**: Mark all notifications as read
**Authentication**: Required

#### DELETE /notifications/:id
**Purpose**: Delete notification
**Authentication**: Required

### 3.7 Admin Endpoints

#### GET /admin/dashboard/stats
**Purpose**: Get dashboard statistics
**Authentication**: Admin role required
**Response**: Platform statistics (users, restaurants, orders, revenue)

#### GET /admin/users
**Purpose**: Get all users with filtering
**Authentication**: Admin role required
**Query Parameters**: page, limit, role, city, is_active

#### PUT /admin/users/:id/status
**Purpose**: Update user status
**Authentication**: Admin role required
**Request Body**:
```json
{
  "is_active": "boolean"
}
```

#### GET /admin/restaurants
**Purpose**: Get all restaurants
**Authentication**: Admin role required

#### GET /admin/orders
**Purpose**: Get all orders
**Authentication**: Admin role required

#### POST /admin/wallets/users/:userId/manage
**Purpose**: Manage user wallet
**Authentication**: Admin role required
**Request Body**:
```json
{
  "type": "topup|deduct",
  "amount": "positive number",
  "description": "string (5-500 chars)"
}
```

#### POST /admin/wallets/restaurants/:restaurantId/manage
**Purpose**: Manage restaurant wallet
**Authentication**: Admin role required

#### GET /admin/wallets/transactions
**Purpose**: Get wallet transactions
**Authentication**: Admin role required

#### GET /admin/chats
**Purpose**: Get admin support chats
**Authentication**: Admin role required

#### GET /admin/chats/:chatId/messages
**Purpose**: Get chat messages
**Authentication**: Admin role required

#### POST /admin/chats/:chatId/messages
**Purpose**: Send chat message
**Authentication**: Admin role required

#### POST /admin/support/chat
**Purpose**: Create support chat
**Authentication**: Required
**Request Body**:
```json
{
  "subject": "string (5-255 chars)",
  "message": "string (10-2000 chars)"
}
```

## 4. Frontend Application Structure

### 4.1 Customer Application

#### 4.1.1 Pages/Views
1. **Home/Landing**: Restaurant browsing, search by city
2. **Restaurant Details**: Menu viewing, restaurant info, reviews
3. **Menu Ordering**: Multi-day menu selection, cart management
4. **Checkout**: Order summary, payment processing
5. **Order History**: View past and current orders
6. **Order Details**: Track order status, delivery confirmation
7. **Profile**: Personal info management, order preferences
8. **Reviews**: Create and view reviews
9. **Notifications**: Order updates and system notifications
10. **Support**: Customer support chat with admin

#### 4.1.2 Key Features
- **Restaurant Discovery**: Browse restaurants by city, view ratings
- **Multi-Day Ordering**: Select menus for multiple days in one cart
- **Order Tracking**: Real-time status updates from pending to delivered
- **Delivery Confirmation**: "Order Received" button after delivery
- **Review System**: Rate and review delivered orders
- **Wallet Integration**: View balance and transaction history

#### 4.1.3 User Flow
1. Browse restaurants in their city
2. View restaurant menus and daily schedules
3. Add menu items for desired delivery dates to cart
4. Checkout with payment (wallet integration)
5. Track order status and receive notifications
6. Confirm delivery and leave reviews

### 4.2 Merchant Application

#### 4.2.1 Pages/Views
1. **Dashboard**: Order summary, revenue stats, new order alerts
2. **Restaurant Management**: Create/edit restaurants, verification status
3. **Menu Management**: CRUD menu items, set daily schedules
4. **Order Management**: View incoming orders, update status
5. **Delivery Management**: Mark orders as shipped/delivered
6. **Wallet**: View balance, transaction history, withdrawal requests
7. **Reviews**: View customer reviews and ratings
8. **Profile**: Business information management
9. **Notifications**: New orders, payment confirmations
10. **Support**: Chat with admin for platform issues

#### 4.2.2 Key Features
- **Restaurant Verification**: Submit restaurant for admin approval
- **Menu Scheduling**: Set weekly menu schedules per day
- **Order Processing**: Confirm orders, update delivery status
- **Delivery Confirmation**: Mark when orders are delivered
- **Financial Management**: View earnings and request withdrawals
- **Analytics**: Sales data and customer feedback

#### 4.2.3 User Flow
1. Register and create restaurant profile
2. Wait for admin verification
3. Set up menu items and weekly schedules
4. Receive and process incoming orders
5. Manage delivery confirmations
6. Track earnings and request withdrawals

### 4.3 Admin Application

#### 4.3.1 Pages/Views
1. **Dashboard**: Platform statistics, quick actions
2. **User Management**: View/manage all users, status updates
3. **Restaurant Verification**: Approve/reject restaurant applications
4. **Order Management**: View all orders, manual cancellations
5. **Financial Management**: Wallet top-ups/deductions, transaction review
6. **Review Moderation**: View/delete inappropriate reviews
7. **Support Center**: Handle customer support chats
8. **Analytics**: Platform metrics and reports
9. **System Settings**: Platform configuration

#### 4.3.2 Key Features
- **Restaurant Verification**: Review and approve/reject new restaurants
- **User Management**: Activate/deactivate users, role management
- **Order Oversight**: View all orders, manual intervention capability
- **Financial Control**: Manage wallet balances across platform
- **Support System**: Real-time chat with users
- **Content Moderation**: Review and manage user-generated content

#### 4.3.3 User Flow
1. Monitor platform activity via dashboard
2. Review new restaurant applications
3. Handle user support requests
4. Manage financial transactions when needed
5. Moderate content and user behavior

## 5. Component Specifications

### 5.1 Common Components

#### 5.1.1 AppHeader
- **Purpose**: Main navigation header
- **Features**: User menu, notifications, search
- **Props**: user_role, notification_count
- **Responsive**: Mobile hamburger menu

#### 5.1.2 AppSidebar
- **Purpose**: Navigation sidebar for different roles
- **Features**: Role-based menu items
- **Props**: user_role, active_route
- **Responsive**: Collapsible on mobile

#### 5.1.3 LoadingSpinner
- **Purpose**: Loading state indicator
- **Features**: Different sizes, overlay option
- **Props**: size, overlay, text

#### 5.1.4 EmptyState
- **Purpose**: Empty data state display
- **Features**: Icon, title, description, action button
- **Props**: icon, title, description, action_text, action_handler

#### 5.1.5 ConfirmDialog
- **Purpose**: Confirmation modal for destructive actions
- **Features**: Title, message, confirm/cancel buttons
- **Props**: title, message, confirm_text, cancel_text, on_confirm

#### 5.1.6 NotificationToast
- **Purpose**: Toast notifications for user feedback
- **Features**: Auto-dismiss, different types (success, error, warning)
- **Props**: type, message, duration, persistent

### 5.2 Restaurant Components

#### 5.2.1 RestaurantCard
- **Purpose**: Restaurant display in lists
- **Features**: Image, name, rating, cuisine type, status badge
- **Props**: restaurant, on_click, show_status

#### 5.2.2 RestaurantDetails
- **Purpose**: Complete restaurant information
- **Features**: Image gallery, info tabs, reviews section
- **Props**: restaurant, is_owner, can_edit

#### 5.2.3 RestaurantForm
- **Purpose**: Create/edit restaurant
- **Features**: Form validation, image upload, address input
- **Props**: restaurant_data, on_submit, on_cancel

### 5.3 Menu Components

#### 5.3.1 MenuItemCard
- **Purpose**: Menu item display
- **Features**: Image, name, price, description, add to cart
- **Props**: menu_item, on_add_to_cart, show_price

#### 5.3.2 MenuSchedule
- **Purpose**: Weekly menu schedule display
- **Features**: Day tabs, menu items per day, drag-drop reordering
- **Props**: schedule, restaurant_id, on_update

#### 5.3.3 MenuForm
- **Purpose**: Create/edit menu item
- **Features**: Price validation, image upload, description
- **Props**: menu_item, restaurant_id, on_submit

### 5.4 Order Components

#### 5.4.1 OrderCard
- **Purpose**: Order summary display
- **Features**: Status badges, items list, total amount, actions
- **Props**: order, show_actions, on_status_update

#### 5.4.2 OrderDetails
- **Purpose**: Complete order information
- **Features**: Timeline view, item details, delivery info
- **Props**: order, can_edit, on_action

#### 5.4.3 CartItem
- **Purpose**: Shopping cart item
- **Features**: Quantity controls, remove button, price calculation
- **Props**: item, on_quantity_change, on_remove

#### 5.4.4 CheckoutForm
- **Purpose**: Order checkout process
- **Features**: Address input, payment method, order summary
- **Props**: cart_items, total_amount, on_submit

### 5.5 Review Components

#### 5.5.1 ReviewCard
- **Purpose**: Review display
- **Features**: Star rating, review text, user info, date
- **Props**: review, show_actions, on_edit, on_delete

#### 5.5.2 ReviewForm
- **Purpose**: Create/edit review
- **Features**: Star rating input, text area, validation
- **Props**: review_data, on_submit, on_cancel

#### 5.5.3 RatingDisplay
- **Purpose**: Star rating display
- **Features**: Interactive stars, average rating, count
- **Props**: rating, max_rating, interactive, on_change

## 6. State Management (Pinia Stores)

### 6.1 Auth Store
```javascript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    is_authenticated: false,
    loading: false
  }),
  getters: {
    is_customer: (state) => state.user?.role === 'customer',
    is_merchant: (state) => state.user?.role === 'merchant',
    is_admin: (state) => state.user?.role === 'admin'
  },
  actions: {
    async login(credentials) { /* ... */ },
    async register(userData) { /* ... */ },
    async logout() { /* ... */ },
    async fetchProfile() { /* ... */ },
    async updateProfile(userData) { /* ... */ }
  }
})
```

### 6.2 Restaurant Store
```javascript
export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurants: [],
    current_restaurant: null,
    my_restaurants: [],
    loading: false,
    pagination: {}
  }),
  actions: {
    async fetchRestaurants(params) { /* ... */ },
    async fetchRestaurant(id) { /* ... */ },
    async createRestaurant(data) { /* ... */ },
    async updateRestaurant(id, data) { /* ... */ },
    async fetchMyRestaurants() { /* ... */ }
  }
})
```

### 6.3 Menu Store
```javascript
export const useMenuStore = defineStore('menu', {
  state: () => ({
    menu_items: [],
    schedule: [],
    loading: false
  }),
  actions: {
    async fetchMenuItems(restaurantId, params) { /* ... */ },
    async fetchSchedule(restaurantId, params) { /* ... */ },
    async createMenuItem(data) { /* ... */ },
    async updateMenuItem(id, data) { /* ... */ },
    async deleteMenuItem(id) { /* ... */ },
    async createSchedule(data) { /* ... */ },
    async deleteSchedule(id) { /* ... */ }
  }
})
```

### 6.4 Order Store
```javascript
export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    current_order: null,
    cart: [],
    loading: false,
    pagination: {}
  }),
  getters: {
    cart_total: (state) => state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    cart_count: (state) => state.cart.reduce((count, item) => count + item.quantity, 0)
  },
  actions: {
    async createOrder(data) { /* ... */ },
    async fetchMyOrders(params) { /* ... */ },
    async fetchOrder(id) { /* ... */ },
    async fetchRestaurantOrders(restaurantId, params) { /* ... */ },
    async updateOrderStatus(id, status) { /* ... */ },
    async confirmDelivery(id, type) { /* ... */ },
    addToCart(item) { /* ... */ },
    removeFromCart(item_id) { /* ... */ },
    updateCartItemQuantity(item_id, quantity) { /* ... */ },
    clearCart() { /* ... */ }
  }
})
```

### 6.5 Notification Store
```javascript
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unread_count: 0,
    loading: false
  }),
  actions: {
    async fetchNotifications(params) { /* ... */ },
    async fetchUnreadCount() { /* ... */ },
    async markAsRead(id) { /* ... */ },
    async markAllAsRead() { /* ... */ },
    async deleteNotification(id) { /* ... */ }
  }
})
```

## 7. Routing and Navigation

### 7.1 Route Structure
```javascript
const routes = [
  // Public routes
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guest: true }
  },

  // Customer routes
  {
    path: '/customer',
    component: CustomerLayout,
    meta: { requiresAuth: true, roles: ['customer'] },
    children: [
      { path: 'restaurants', name: 'customer-restaurants', component: RestaurantListView },
      { path: 'restaurants/:id', name: 'restaurant-details', component: RestaurantDetailsView },
      { path: 'cart', name: 'cart', component: CartView },
      { path: 'checkout', name: 'checkout', component: CheckoutView },
      { path: 'orders', name: 'orders', component: OrderListView },
      { path: 'orders/:id', name: 'order-details', component: OrderDetailsView },
      { path: 'profile', name: 'customer-profile', component: ProfileView },
      { path: 'reviews', name: 'my-reviews', component: MyReviewsView },
      { path: 'support', name: 'customer-support', component: SupportView }
    ]
  },

  // Merchant routes
  {
    path: '/merchant',
    component: MerchantLayout,
    meta: { requiresAuth: true, roles: ['merchant'] },
    children: [
      { path: 'dashboard', name: 'merchant-dashboard', component: DashboardView },
      { path: 'restaurants', name: 'my-restaurants', component: MyRestaurantsView },
      { path: 'restaurants/new', name: 'new-restaurant', component: RestaurantFormView },
      { path: 'restaurants/:id/edit', name: 'edit-restaurant', component: RestaurantFormView },
      { path: 'menu', name: 'menu-management', component: MenuManagementView },
      { path: 'menu/new', name: 'new-menu', component: MenuFormView },
      { path: 'menu/:id/edit', name: 'edit-menu', component: MenuFormView },
      { path: 'schedule', name: 'menu-schedule', component: MenuScheduleView },
      { path: 'orders', name: 'merchant-orders', component: OrderListView },
      { path: 'wallet', name: 'merchant-wallet', component: WalletView },
      { path: 'profile', name: 'merchant-profile', component: ProfileView },
      { path: 'support', name: 'merchant-support', component: SupportView }
    ]
  },

  // Admin routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: DashboardView },
      { path: 'users', name: 'user-management', component: UserManagementView },
      { path: 'restaurants', name: 'restaurant-management', component: RestaurantManagementView },
      { path: 'restaurants/:id/verify', name: 'restaurant-verification', component: RestaurantVerificationView },
      { path: 'orders', name: 'order-management', component: OrderManagementView },
      { path: 'wallets', name: 'wallet-management', component: WalletManagementView },
      { path: 'reviews', name: 'review-moderation', component: ReviewModerationView },
      { path: 'support', name: 'admin-support', component: AdminSupportView },
      { path: 'chats/:id', name: 'chat-details', component: ChatDetailsView }
    ]
  }
]
```

### 7.2 Route Guards
```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.is_authenticated) {
    next('/login')
    return
  }

  // Check if route is guest only
  if (to.meta.guest && authStore.is_authenticated) {
    next('/')
    return
  }

  // Check role-based access
  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    next('/unauthorized')
    return
  }

  next()
})
```

## 8. API Service Layer

### 8.1 HTTP Client Configuration
```javascript
// services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export default api
```

### 8.2 Service Classes
```javascript
// services/auth.service.js
import api from './api'

export const authService = {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },

  register(userData) {
    return api.post('/auth/register', userData)
  },

  getProfile() {
    return api.get('/auth/profile')
  },

  updateProfile(userData) {
    return api.put('/auth/profile', userData)
  },

  changePassword(passwordData) {
    return api.put('/auth/change-password', passwordData)
  }
}

// services/restaurant.service.js
export const restaurantService = {
  getRestaurants(params) {
    return api.get('/restaurants', { params })
  },

  getRestaurant(id) {
    return api.get(`/restaurants/${id}`)
  },

  createRestaurant(data) {
    return api.post('/restaurants', data)
  },

  updateRestaurant(id, data) {
    return api.put(`/restaurants/${id}`, data)
  },

  getMyRestaurants(params) {
    return api.get('/restaurants/my/restaurants', { params })
  },

  verifyRestaurant(id, data) {
    return api.put(`/restaurants/${id}/verify`, data)
  }
}
```

## 9. UI/UX Guidelines

### 9.1 Design System

#### 9.1.1 Color Palette
- **Primary**: Blue (blue-500, blue-600)
- **Secondary**: Green (green-500, green-600)
- **Success**: Green (green-500)
- **Warning**: Yellow (yellow-500)
- **Error**: Red (red-500)
- **Neutral**: Gray shades (gray-50 to gray-900)

#### 9.1.2 Typography
- **Headings**: Font weights 600-700, larger sizes
- **Body**: Font weight 400, readable sizes
- **Small Text**: Font weight 400, smaller sizes for metadata

#### 9.1.3 Spacing
- **Base unit**: 4px (0.25rem)
- **Component padding**: 1rem (16px)
- **Section spacing**: 2rem (32px)
- **Container max-width**: 1200px

#### 9.1.4 Border Radius
- **Buttons**: 0.375rem (6px)
- **Cards**: 0.5rem (8px)
- **Inputs**: 0.375rem (6px)

### 9.2 Component States

#### 9.2.1 Interactive Elements
- **Hover**: Slight color change, elevation increase
- **Focus**: Outline ring (2px, blue-500)
- **Active**: Scale down slightly, deeper color
- **Disabled**: Opacity reduced, no interactions

#### 9.2.2 Loading States
- **Buttons**: Show spinner, disable interaction
- **Forms**: Field-level loading indicators
- **Pages**: Full-page skeleton loaders
- **Data**: Loading placeholders with animation

#### 9.2.3 Empty States
- **Illustrations**: Contextual icons or graphics
- **Messaging**: Clear, helpful descriptions
- **Actions**: Primary CTA to resolve empty state

### 9.3 Responsive Design

#### 9.3.1 Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)

#### 9.3.2 Mobile Adaptations
- **Navigation**: Hamburger menu, slide-out drawer
- **Tables**: Horizontal scroll, card view on mobile
- **Forms**: Single column, larger touch targets
- **Images**: Responsive sizing, lazy loading

### 9.4 Accessibility

#### 9.4.1 Keyboard Navigation
- **Tab order**: Logical flow through interactive elements
- **Focus indicators**: Visible focus rings
- **Shortcuts**: Keyboard shortcuts for power users

#### 9.4.2 Screen Reader Support
- **Semantic HTML**: Proper use of headings, landmarks
- **ARIA labels**: Descriptive labels for custom elements
- **Alt text**: Meaningful descriptions for images

#### 9.4.3 Visual Accessibility
- **Color contrast**: WCAG AA compliance
- **Text sizing**: Respect user's browser settings
- **Motion**: Reduced motion support

## 10. Performance Considerations

### 10.1 Code Splitting
- **Route-based**: Lazy load route components
- **Component-based**: Lazy load heavy components
- **Vendor splitting**: Separate third-party libraries

### 10.2 Data Optimization
- **Pagination**: Implement cursor-based pagination
- **Caching**: Cache frequently accessed data
- **Images**: Optimize and lazy load images
- **API calls**: Debounce search requests

### 10.3 Bundle Optimization
- **Tree shaking**: Remove unused code
- **Compression**: Gzip compression
- **CDN**: Serve static assets from CDN
- **Service worker**: Cache assets for offline use

## 11. Security Considerations

### 11.1 Authentication
- **JWT storage**: httpOnly cookies or secure localStorage
- **Token refresh**: Implement token refresh mechanism
- **Logout**: Clear all authentication data

### 11.2 Data Validation
- **Client-side**: Validate user inputs before sending
- **Server-side**: Never trust client validation
- **Sanitization**: Prevent XSS attacks

### 11.3 API Security
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure proper CORS policies
- **Rate limiting**: Implement client-side rate limiting

## 12. Testing Strategy

### 12.1 Unit Testing
- **Components**: Test component rendering and interactions
- **Composables**: Test business logic
- **Utilities**: Test helper functions
- **Services**: Test API service methods

### 12.2 Integration Testing
- **API integration**: Test API service integration
- **Store integration**: Test store interactions
- **Routing**: Test navigation and route guards

### 12.3 End-to-End Testing
- **User flows**: Test critical user journeys
- **Cross-browser**: Test on multiple browsers
- **Mobile**: Test on mobile devices

## 13. Deployment

### 13.1 Build Configuration
- **Production build**: Optimized for performance
- **Environment variables**: Secure configuration
- **Asset optimization**: Minification and compression

### 13.2 Hosting Options
- **Static hosting**: Vercel, Netlify, GitHub Pages
- **CDN**: Cloudflare for global distribution
- **Server**: Traditional web server with SSR

### 13.3 CI/CD Pipeline
- **Automated testing**: Run tests on pull requests
- **Automated deployment**: Deploy on merge to main
- **Rollback**: Quick rollback capability

## 14. Success Metrics

### 14.1 Performance Metrics
- **Page load time**: < 3 seconds initial load
- **Time to interactive**: < 5 seconds
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

### 14.2 User Experience Metrics
- **Task completion rate**: > 95% for core flows
- **Error rate**: < 1% for user interactions
- **Mobile usability**: 100% mobile-friendly

### 14.3 Business Metrics
- **Conversion rate**: Track sign-ups and orders
- **User retention**: Measure user engagement over time
- **Support tickets**: Monitor user issues and resolutions

---

This comprehensive PRD-2 provides frontend developers with detailed specifications for building Vue.js applications that integrate seamlessly with the existing Node.js backend API. The document includes technical specifications, component designs, state management patterns, and implementation guidelines for creating a complete daily catering platform.