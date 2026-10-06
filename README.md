# 🩸 Smart Blood Network

Smart Blood Network is a web-based blood donation and emergency blood request management system designed to connect blood donors with patients who need blood.

The system helps manage donors, blood requests, compatible blood matching, donor responses, request completion, and analytics through a centralized dashboard.

## 🚀 Features

- Donor Registration and Management
- Patient Blood Request Management
- Blood Group Compatibility Matching
- Distance-based Donor Matching
- Urgency and Critical Request Tracking
- Donor Availability and Verification
- Donor Response Management
- Request Completion Tracking
- Dashboard with Statistics
- Analytics for Blood Groups, Requests and Urgency
- SQLite Database
- REST API using Express.js

## 🔄 System Workflow

Donor Registration
↓
Patient Blood Request
↓
Blood Compatibility Matching
↓
Donor Response
↓
Request Completion
↓
Dashboard & Analytics

## 🛠️ Technologies Used

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js
- REST API

### Database
- SQLite
- better-sqlite3

### Development Tools
- VS Code
- Git
- GitHub
- npm

## 📂 Project Structure

smart-blood-network-web/
│
├── client/
│   └── Frontend application
│
├── server/
│   └── Backend API and database
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore

## ⚙️ Installation & Setup

### 1. Clone the Repository

git clone https://github.com/AdnanAli789/smart-blood-network.git

### 2. Open the Project

cd smart-blood-network

### 3. Install Dependencies

npm install
npm run install:all

### 4. Start the Application

npm run dev

The application will run on:

Frontend: http://localhost:5173
Backend: http://localhost:4000

## 🔌 API Endpoints

### Donors

GET    /api/donors
POST   /api/donors
PATCH  /api/donors/:id

### Blood Requests

GET    /api/requests
POST   /api/requests
PATCH  /api/requests/:id
GET    /api/requests/:id
GET    /api/requests/:id/matches
POST   /api/requests/:id/responses
POST   /api/requests/:id/complete

### Responses

PATCH  /api/responses/:id

### Dashboard & Analytics

GET    /api/dashboard
GET    /api/analytics

## 🎯 Main Objective

The main objective of Smart Blood Network is to provide a simple digital platform for managing blood donors and emergency blood requests while helping identify suitable donors based on blood compatibility, availability, verification, and distance.

## 🏆 Hackathon Project

Smart Blood Network was developed as a hackathon project focused on solving a real-world healthcare and emergency blood management problem through technology.

## 👨‍💻 Developer

Adnan Ali

Software Engineering Student

GitHub:
https://github.com/AdnanAli789

LinkedIn:
https://linkedin.com/in/adnan-ali-569267323

## 📜 License

This project is developed for educational and hackathon purposes.