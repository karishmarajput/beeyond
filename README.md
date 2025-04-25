# Quick Commerce Order & Delivery Tracking System

This application offers a comprehensive set of features designed to streamline the order and delivery tracking process. It includes secure authentication for both customers and delivery partners, efficient order management with real-time updates powered by WebSockets (Socket.IO), and a dedicated interface for delivery partners to accept orders and update their status. With robust database management using MongoDB and scalability ensured through cloud deployment, the system provides a seamless and reliable experience for users.
## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
---

## Features
- **Customer Features**:
  - Place orders.
  - Track delivery status in real-time.
- **Delivery Partner Features**:
  - Accept orders.
  - Update delivery status in real-time.

---

## Tech Stack
**Frontend**: React.js  
**Backend**: Node.js, Express.js  
**Database**: MongoDB (NoSQL)  
**Real-Time Updates**: Socket.IO  

---

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd beeyond
   ```
2. Run Backend
   ```bash
   cd quick-commerce-backend
   npm i
   node server.js
   cd ..
   ```
3. Run Frontend
   ```bash
   cd client
   npm i
   npm run dev
   ```
   
