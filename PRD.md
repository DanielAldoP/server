PRD: Daily Catering Platform (Version 3)
1. Introduction
Project Name: "Sangu Time" (Placeholder)

Problem: Users find it difficult to locate varied and managed daily catering options. Concurrently, culinary businesses struggle with marketing, managing scheduled menus, and handling daily orders digitally.

Solution: A User-Generated Content (UGC) platform where users can register their restaurants (which are admin-verified), set up scheduled menus, and receive orders. Customers can order daily/weekly menus from restaurants in the same city, supported by a clear notification system and cancellation process.

2. Core Objectives
For Customers: To provide a curated platform for flexibly ordering daily/weekly catering with clear notifications on order status.

For Merchants (Restaurant Owners): To provide tools for managing restaurants, menus, orders, finances, and receiving crucial sales-related notifications.

For Admin: To provide a control panel for verification, monitoring, financial management, support (chat), and mediation (manual cancellations/refunds).

3. User Roles
Customer: A registered user who orders food.

Merchant (Restaurant Owner): A registered user who registers and manages one or more restaurants.

Admin: The platform manager with full access rights.

4. Feature Details
👤 4.1. General & Authentication Features
User Registration: Name, Email, Password, Phone Number, City.

Login: Email and Password.

User Profile: Manage personal data.

Chat with Admin Feature: Users (Customers & Merchants) can initiate a support chat/ticket with the Admin.

🍽️ 4.2. Merchant (Restaurant Owner) Features
Restaurant Creation:

Can register one or more restaurants (Name, Full Address, City, Description, Photo).

Admin Verification: New restaurants will have a pending_verification status and must be Approved by an Admin.

Address Masking: The full address is only visible to the Owner and Admin.

Menu Management:

CRUD for Menu Items (Name, Price, Description, Photo).

Daily Menu Scheduling (Monday-Sunday).

Order Management:

View incoming daily orders (Daily_Orders) (Status: Pending, Confirmed, Delivered, Cancelled).

Change order status (e.g., Pending to Confirmed).

Logistics: Delivery is handled entirely by the Merchant.

Delivery Confirmation: A "Mark as Shipped" button (sets merchant_confirmed_delivery = true).

Cancellation by Merchant (New):

Merchants can cancel a Daily_Order ONLY if its status is still Pending.

Cancellations are not allowed by the Merchant if the status is Confirmed or Delivered.

Restaurant Wallet & Fund Disbursement:

View balance, mutation history, and request fund withdrawals (via Xendit/Midtrans).

🛒 4.3. Customer Features
Exploration:

View a list of restaurants (only active and in the same city).

Ordering (Multi-Day Flow):

Select menus for a single day, multiple days, or a full week in one cart.

Checkout and make a single payment (via Xendit/Midtrans).

This payment creates one master Order and multiple Daily_Order (one per delivery day).

Order History:

View order details.

Receipt Confirmation: An "Order Received" button (sets customer_confirmed_delivery = true).

Cancellation by Customer (New):

Customers can cancel a Daily_Order ONLY if its status is still Pending.

Cancellations are not allowed by the Customer if the status is Confirmed or Delivered.

Rating & Review:

After a Daily_Order status is Delivered, the customer can provide a Rating (1-5 stars) and a Review.

⚙️ 4.4. Admin Features
Dashboard & User/Transaction Management: (Standard).

Restaurant Management (Verification):

View all restaurants, including those pending_verification.

Approve or Reject new restaurants.

View the full, unmasked address of restaurants.

Financial Management:

Top-up/Deduct funds from User Wallets and Restaurant Wallets.

Chat/Support Management:

Panel to reply to messages from Customers and Merchants.

Rating & Review Management:

Moderate (view/delete) inappropriate reviews.

Manual Cancellation & Refund (Clarified):

Admins have the authority to cancel a Daily_Order in ANY state (including Confirmed).

Procedure:

Admin receives a request (via chat, etc.).

Admin contacts the user (Customer/Merchant) via registered Phone/Email for confirmation.

Admin manually changes the Daily_Order status to Cancelled.

Admin manually processes the refund (if necessary) by:

"Deducting" from the Restaurant_Wallet.

"Topping up" the User_Wallet.

🔔 4.5. Notification Feature (NEW)
The system will send in-app notifications based on the following triggers:

For Merchants (Restaurant Owners):

New Order: When a master Order is successfully paid by a customer (order.paid).

Order Complete (Funds In): When a Daily_Order status changes to Delivered and funds are transferred to the Restaurant_Wallet.

Order Cancelled: When a Daily_Order status changes to Cancelled.

For Customers:

Payment Successful: When a master Order is successfully created and paid (payment.success).

Payment Failed: When payment via the payment gateway fails (payment.failed).

Order Cancelled: When a Daily_Order status changes to Cancelled.

Order Delivered: When a Daily_Order status changes to Delivered (after dual confirmation).

Order Confirmed by Merchant: When a Merchant changes a Daily_Order status from Pending to Confirmed.

5. Technical Specifications
Backend: Node.js, Express.js

ORM: Sequelize

Frontend: Vue.js, Tailwind CSS

Database: MySQL

Payment Gateway: Xendit / Midtrans

6. 🗃️ Database Structure (MySQL)
Users (city)

User_Wallets

Restaurants (city, status ENUM['pending_verification', 'active', 'rejected', 'suspended'])

Restaurant_Wallets

Menus

Daily_Menus (Pivot table for menu and day_of_week)

Orders (Master payment record)

Daily_Orders (status: 'pending', 'confirmed', 'delivered', 'cancelled', merchant_confirmed_delivery, customer_confirmed_delivery)

Daily_Order_Items (Items for each daily order)

Reviews

Wallet_Transactions

Admin_Chats

Admin_Chat_Messages

Notifications (New Table)

id (INT, PK, AI)

user_id (INT, FK -> Users.id) - Notification recipient

message (TEXT)

type (ENUM['order_paid', 'order_complete', 'order_cancelled', ...])

related_order_id (INT, FK -> Orders.id, Nullable)

related_daily_order_id (INT, FK -> Daily_Orders.id, Nullable)

is_read (BOOLEAN, Default: false)

createdAt (DATETIME)

7. Assumptions & Out of Scope
Logistics: Handled entirely by the Merchant. The platform does not provide drivers.

Chat: No Customer-Merchant chat. Chat is only User-Admin.

Promos: Vouchers, discounts, and global promo features are out of scope for V1.

Notifications: For V1, notifications are in-app. Push notifications and Email/WA notifications are future developments.