# 🎓 UniConnect - University Social Platform

UniConnect is a MERN stack-based social platform designed exclusively for university students and faculty. It provides a digital space where users can connect, collaborate, and engage in academic and extracurricular activities.

---

## 🚀 Features

- **User Authentication**: Secure sign-up and login with role-based access (students, faculty, admins).
- **News Feed & Posts**: Share updates, images, and engage with the campus community.
- **Groups & Communities**: Join or create student clubs, academic groups, and discussion forums.
- **Messaging System**: Real-time chat functionality.
- **Events & Notices**: Stay updated with university events and announcements.
- **Marketplace**: Buy and sell textbooks, gadgets, and services within the university.
- **AI-Powered Content Moderation**: Automatic filtering of inappropriate content.

---

## 🛠 Technology Stack

- **Frontend**: React.js, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time Communication**: Socket.io
- **Deployment**: Vercel / Netlify (Frontend), Heroku / AWS (Backend)

---

## 📦 Getting Started

Follow the instructions below to set up the project locally.

---

### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/Manassss/Uni-Sphere.git
cd Uni-Sphere
```

### 2️⃣ **Set up the FrontEnd**

```bash
cd client
npm install
npm start
```
### 3️⃣ **Set up the BackendEnd**
Open Another terminal in Root Directory
```bash
cd server
npm install
```
### 4️⃣ **Configure Environment Variables**
In the server directory, create a file named .env.
Add the following environment variables to the .env file:
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
```
### 5️⃣ **Run the Backend Server**
```bash
node server.js
```



