# 🛒 ClickCart – E-Commerce Backend API

ClickCart is a modern, scalable, and secure backend for e-commerce platforms built with **Node.js**, **Express**, and **MongoDB**.  
It provides a RESTful API for managing products, categories, users, orders, and payments.

---

## ✨ Features

- Modular RESTful API structure
- JWT-based authentication and authorization
- Stripe payment integration
- Centralized error handling
- Environment variable management with dotenv
- Production-ready architecture

---

## 🧰 Tech Stack

- **Node.js** – Backend runtime
- **Express.js** – Web framework
- **MongoDB** – NoSQL database
- **Mongoose** – ODM for MongoDB
- **JWT** – Authentication
- **Stripe** – Payment gateway
- **dotenv** – Environment variable management

---

## ⚙️ Installation

ClickCart/
├── controllers/       # Route logic and handlers
├── models/            # Mongoose schemas
├── routes/            # API route definitions
├── middleware/        # Auth, error handling, etc.
├── utils/             # Helper functions
├── config/            # DB and Stripe setup
├── .env.example       # Environment variable template
├── server.js          # Entry point
└── README.md          # Project documentation


```bash
git clone https://github.com/i9haow/ClickCart.git
cd ClickCart
npm install
npm run dev
