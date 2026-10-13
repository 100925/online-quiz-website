const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const questionsRouter = require("./routes/questions");
const submitRouter = require("./routes/submit");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quizmaster";

// Security Middleware: Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Rate Limiting Middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});
app.use("/api/", apiLimiter);

// CORS Configuration
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : [
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5501",
      "http://localhost:5500",
      "http://localhost:5501"
    ];

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

app.use(express.json());

// Database connection check middleware for API requests
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected. Please check your MongoDB connection."
    });
  }
  next();
});

// Serve frontend static files securely
app.use("/style.css", express.static(path.join(__dirname, "../style.css")));
app.use("/script.js", express.static(path.join(__dirname, "../script.js")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// API Info endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "QuizMaster API",
    status: "online",
    healthCheck: "/api/health",
    questionsEndpoint: "/api/questions",
    categoriesEndpoint: "/api/questions/categories"
  });
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "degraded",
    database: states[dbState] || "unknown",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/questions", questionsRouter);
app.use("/api/submit", submitRouter);
app.use("/api/results", submitRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// Start Server after connecting to MongoDB
async function startServer() {
  console.log("=========================================");
  console.log(" QuizMaster - Backend Server");
  console.log("=========================================");
  console.log(`Connecting to MongoDB...`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log("MongoDB connection established successfully.");

    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`QuizMaster Server running at: http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
        console.log(`Questions API: http://localhost:${PORT}/api/questions`);
        console.log("=========================================");
        resolve(server);
      });
      server.on("error", reject);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB!");
    console.error(`Error details: ${error.message}`);
    console.error("\nSetup instructions:");
    console.error("1. Ensure MongoDB is running locally, OR");
    console.error("2. Add your MongoDB Atlas connection string in backend/.env under MONGODB_URI.");
    console.error("3. Ensure your IP address is whitelisted in MongoDB Atlas Network Access.\n");
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
