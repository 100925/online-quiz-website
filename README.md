
# 🧠 QuizMaster – Online Quiz Platform

QuizMaster is a full-stack, responsive web application designed for students, developers, and quiz enthusiasts to test their knowledge across multiple domains such as **Programming, Java, Python, SQL, and General Knowledge**.

Built with a clean vanilla **HTML5 / CSS3 / JavaScript** frontend and a secure **Node.js / Express.js / MongoDB Atlas** backend, QuizMaster is suitable for college final-year submissions, portfolio showcases, and production deployment.

---

## 🌟 Key Features

### 🖥️ Frontend (Client Experience)
- **Modern Brand Interface:** Purple-themed UI with clean typography, high-contrast accessible controls, and responsive layout for mobile, tablet, and desktop.
- **Dynamic Category & Difficulty Selection:** Choose specific topics (Programming, Java, Python, SQL, General Knowledge) and skill levels (Easy, Medium, Hard, or All).
- **Interactive Quiz Navigation:** Jump seamlessly between questions with **Next** and **Previous** buttons without losing answers.
- **Answer Modification:** Select and alter choices freely before final submission.
- **Countdown Timer:** 5-minute timed quiz with warning animations at less than 60 seconds and automatic submission when time expires.
- **Submission Confirmation Modal:** Warns the user of unanswered questions before finalizing to prevent accidental early submissions.
- **Detailed Results & Performance Analytics:** Displays total questions, correct count, wrong count, unanswered count, calculated score, and percentage.
- **Question Review Breakdown:** Collapsible review showing each question, your answer, the correct answer, and an in-depth explanatory breakdown.
- **Live Backend Health Indicator:** Real-time indicator pill shows whether the backend API is connected.

### 🛡️ Backend & Security
- **Server-Side Score Validation:** The frontend never decides scores or correctness. Answers are securely evaluated against MongoDB records.
- **Protected Question APIs:** Correct answers and explanations are stripped from question endpoints, preventing cheating via browser inspect tools.
- **Persistence:** All completed quiz attempts and question breakdowns are saved in MongoDB Atlas with unique identifiers.
- **Production Hardening:** Protected with **Helmet.js** security headers, **express-rate-limit** DDoS defense, and strict CORS policies.
- **Idempotent Database Seeder:** Easily seeds 35+ original questions without creating duplicates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Modern JavaScript (ES6+), Fetch API |
| **Backend** | Node.js, Express.js |
| **Database & ODM** | MongoDB Atlas / Local MongoDB, Mongoose |
| **Security & Utilities**| Helmet, express-rate-limit, cors, dotenv |

---

## 📁 Project Directory Structure

```text
online-quiz/
├── index.html                 # Main quiz single-page interface
├── style.css                  # Responsive design and theme styles
├── script.js                  # Frontend client logic & REST API integration
├── .gitignore                 # Ignores node_modules, .env, and logs
├── README.md                  # Comprehensive documentation
└── backend/
    ├── server.js              # Express app entry point & static server
    ├── package.json           # Backend dependencies and run scripts
    ├── .env                   # Local environment secrets (not committed)
    ├── .env.example           # Template for environment configuration
    ├── models/
    │   ├── Question.js        # Mongoose Question schema & validation
    │   └── QuizResult.js      # Mongoose QuizResult history schema
    ├── routes/
    │   ├── questions.js       # Safe question retrieval & filtering routes
    │   └── submit.js          # Score evaluation & quiz result persistence
    └── scripts/
        └── seed.js            # Database seeder (35+ sample questions)
```

---

## 📋 Prerequisites

Before running the project, make sure you have installed:
1. **Node.js** (v18.0.0 or later) – [Download Node.js](https://nodejs.org/)
2. **MongoDB**:
   - **Option A (Cloud - Recommended):** A free [MongoDB Atlas](https://www.mongodb.com/atlas) account.
   - **Option B (Local):** [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`.

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
Open your terminal in the `backend` folder and install the required Node.js packages:

```bash
cd backend
npm install
```

> **Note for Windows/Corporate Networks:** If you encounter an SSL error such as `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, run:
> ```bash
> npm install --strict-ssl=false
> ```

---

### Step 2: Configure Environment Variables

1. Inside the `backend` folder, copy `.env.example` to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt: `copy .env.example .env`)*

2. Open `backend/.env` and configure your settings:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/quizmaster
CLIENT_ORIGIN=http://127.0.0.1:5500,http://127.0.0.1:5501,http://localhost:5000
```

---

### Step 3: MongoDB Atlas Setup (Cloud Database)

If you wish to connect QuizMaster to MongoDB Atlas cloud:

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (M0 sandbox).
3. **Set Up Database Access:**
   - Go to **Database Access** > **Add New Database User**.
   - Create a username and password (e.g., `quizadmin` and a strong password).
   - Set privileges to **Read and write to any database**.
4. **Set Up Network Access:**
   - Go to **Network Access** > **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) for development, or add your specific IP address.
5. **Get Connection String:**
   - Go to **Database** > click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/quizmaster?retryWrites=true&w=majority
     ```
6. Paste your connection string into `backend/.env` as the `MONGODB_URI` value, replacing `<username>` and `<password>` with your real user credentials.

---

### Step 4: Seed the Database

Populate your database with the initial 35 sample questions across Programming, Java, Python, SQL, and General Knowledge:

```bash
cd backend
npm run seed
```

**Expected output:**
```text
=========================================
 QuizMaster - Database Seeder
=========================================
Connected to MongoDB successfully.

Seed Summary:
- New questions inserted: 35
- Existing questions skipped: 0
- Total questions now in DB: 35
Database seeding completed successfully!
```

*(Running this script multiple times is completely safe: existing questions are skipped automatically without duplicates).*

---

### Step 5: Start the Backend Server

```bash
cd backend
npm start
```

For automatic reloading during development:
```bash
npm run dev
```

You should see:
```text
=========================================
 QuizMaster - Backend Server
=========================================
MongoDB connection established successfully.
QuizMaster Server running at: http://localhost:5000
Health check: http://localhost:5000/api/health
Questions API: http://localhost:5000/api/questions
=========================================
```

---

### Step 6: Launch the Frontend

You have two convenient ways to access QuizMaster:

#### Option A: Direct Browser Access (Unified Server)
With the backend server running, open your web browser and go to:
👉 **[http://localhost:5000](http://localhost:5000)**

The backend automatically serves `index.html`, `style.css`, and `script.js` securely.

#### Option B: VS Code Live Server / Static Hosting
1. Open the project folder in VS Code.
2. Right-click on `index.html` and click **"Open with Live Server"** (default port `http://127.0.0.1:5500` or `5501`).
3. The frontend will communicate with the backend at `http://localhost:5000/api` through pre-configured CORS headers.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning database connectivity state. |
| `GET` | `/api/questions` | Retrieve questions. Accepts optional `?category=...&difficulty=...&limit=10`. |
| `GET` | `/api/questions/categories` | Returns a list of all distinct question categories available. |
| `GET` | `/api/questions/:id` | Safely retrieves a single question without exposing its answer. |
| `POST`| `/api/submit` | Evaluates answers on the server, calculates score, and saves `QuizResult`. |
| `GET` | `/api/results/:id` | Retrieves a previously saved quiz result by `resultId` or MongoDB `_id`. |

### Sample Submission Request (`POST /api/submit`)
```json
{
  "category": "Python",
  "difficulty": "Easy",
  "timeTaken": 42,
  "answers": [
    { "questionId": "6ace022a42b76d6d484e50ba", "selectedOption": 2 },
    { "questionId": "6ace022a42b76d6d484e50bb", "selectedOption": 3 }
  ]
}
```

### Sample Submission Response (`201 Created`)
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "result": {
    "resultId": "0bf177e1-ff9a-430f-92ef-00ad41c04a9c",
    "totalQuestions": 2,
    "correctAnswers": 2,
    "wrongAnswers": 0,
    "unansweredQuestions": 0,
    "score": 20,
    "maxScore": 20,
    "percentage": 100,
    "timeTaken": 42,
    "selectedAnswers": [ ... ]
  }
}
```

---

## 🧪 Verification & Testing

You can test all endpoints directly using PowerShell:

```powershell
# 1. Health check
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET

# 2. Category list
Invoke-RestMethod -Uri "http://localhost:5000/api/questions/categories" -Method GET

# 3. Filtered questions
Invoke-RestMethod -Uri "http://localhost:5000/api/questions?category=Python&difficulty=Easy" -Method GET
```

---

## 🌐 Production Deployment Guide

### Deploy Backend (e.g. Render / Railway / Render.com)
1. Push your repository to GitHub (ensure `.gitignore` excludes `.env` and `node_modules`).
2. Create a new **Web Service** on Render or Railway connected to your repository.
3. Set the **Root Directory** to `backend`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `npm start`.
6. Add Environment Variables in the hosting dashboard:
   - `MONGODB_URI`: your full MongoDB Atlas connection string.
   - `PORT`: `5000` (or leave default assigned by platform).
   - `CLIENT_ORIGIN`: the URL of your deployed frontend (e.g., `https://your-quiz.vercel.app`).

### Deploy Frontend (e.g. Vercel / Netlify / GitHub Pages)
1. If deploying frontend separately on Vercel or Netlify, place `index.html`, `style.css`, and `script.js` in the deployment root.
2. In `script.js`, ensure `API_BASE` points to your deployed backend URL:
   ```javascript
   const API_BASE = "https://your-quiz-backend.onrender.com/api";
   ```
3. Set your production frontend origin in the backend's `CLIENT_ORIGIN` environment variable so CORS requests are permitted.

---

## ⚠️ Troubleshooting & Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`MongooseServerSelectionError`** | MongoDB is either not running locally or your Atlas IP whitelist is missing your IP. | If using local MongoDB, ensure the Windows MongoDB service is running (`net start MongoDB`). If using Atlas, add `0.0.0.0/0` under Network Access. |
| **`UNABLE_TO_VERIFY_LEAF_SIGNATURE`** | Corporate proxy or antivirus inspecting SSL certificates during `npm install`. | Run `npm install --strict-ssl=false`. |
| **`EADDRINUSE: address already in use :::5000`** | Another node process is already using port 5000. | Change `PORT=5001` in `backend/.env` or terminate the existing process using PowerShell: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force`. |
| **CORS blocked on frontend** | Client domain is not listed in `CLIENT_ORIGIN`. | Add your client URL to `CLIENT_ORIGIN` in `backend/.env` (comma-separated). |

---

## 📄 License
This project is open-source and free to use for educational, college, and portfolio purposes.

