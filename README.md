# 🍲 Local Food Business Web App

This full-stack web application was developed to **market and support local food businesses**, allowing customers to place orders, make payments, and communicate in real-time with delivery drivers.

## 🌟 Features

- 🛍️ **Order Management** – Clients can browse local food offerings, place orders, and receive live updates.
- 💬 **Real-Time Chat** – Integrated chat system between drivers and clients using **WebSockets (Socket.io)** for smooth communication.
- 🔔 **Web Push Notifications** – Customers receive real-time notifications about their order status.
- 💳 **Secure Payments with YOCO** – Payments are handled using the **YOCO API**, with server-side **webhook verification** to confirm successful transactions.
- ☁️ **Cloudinary Integration** – Food images and media assets are stored and served efficiently using **Cloudinary**.
- 🗺️ **Google Maps API** – Customers add delivery addresses with Google Maps autocomplete functionality.

## 🛠️ Tech Stack

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** + **Mongoose**
- **Socket.io** – Real-time WebSocket communication
- **YOCO API** – Local South African payment gateway
- **Cloudinary** – Media hosting
- **Web Push** – Browser notifications
- **Nodemailer** – Email notifications

### Frontend (developed separately)
- **React** + **Redux**
- **Axios** – API communication
- **React Toastify** – UI notifications

## 🎥 Demo Video

🚧 **Note:** The domain `5tygaEats` is currently not active as it has not been paid for.  
However, here's a demo showcasing how the application functioned:

🔗 [Watch the App Demo](https://res.cloudinary.com/duwfiikgg/video/upload/v1749344534/Sequence_02_3_s8xx1d.mp4)



## 📦 Architecture

The backend is built on **Express** with **MongoDB** as the database, integrated closely with **Socket.io** to power real-time chat functionality. Payments are securely processed through YOCO, with webhooks confirming the status. Media uploads are managed through Cloudinary for speed and reliability.

## 📈 Project Goals

- Support and digitize local food businesses
- Improve communication and transparency between customers and delivery drivers
- Provide a secure and modern ordering experience with local payment options

## 🚀 Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/food-backend.git
cd food-backend
npm install
