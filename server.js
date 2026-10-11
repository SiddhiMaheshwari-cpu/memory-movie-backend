require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");

const helmet = require("helmet");

const rateLimit = require("express-rate-limit");

const app = express();

const errorHandler = require("./middleware/errorHandler");

const connectDB = require("./config/db");

// Routes
const routes = require("./routes/testRoutes");
const movieRoutes = require("./routes/movieRoutes");
const aiRoutes = require("./routes/aiRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const scenePlannerRoutes = require("./routes/scenePlannerRoutes");
const videoRendererRoutes = require("./routes/videoRendererRoutes");
const authRoutes = require("./routes/authroutes");
const {swaggerUi, swaggerSpec}
= require("./docs/swagger");


// =======================
// Middleware
// =======================

app.use(express.json());

app.use(helmet());

const cors = require("cors");
const cors = require('cors');

app.use(cors({
    origin: function (origin, callback) {
        // Kisi bhi origin ko dynamically allow karne ke liye
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Preflight requests ke liye zaroori line
app.options('*', cors());

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  })
);

app.use(cookieParser());


// =======================
// Test Route
// =======================

app.post("/test", (req, res) => {
  console.log("TEST BODY:", req.body);

  res.json({
    success: true,
    body: req.body,
  });
});


// =======================
// API Routes
// =======================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);
app.use("/api/auth", authRoutes);

app.use("/api/test", routes);

app.use("/", movieRoutes);

app.use("/", uploadRoutes);

app.use("/", aiRoutes);

app.use("/movies", scenePlannerRoutes);

app.use("/movies", videoRendererRoutes);


// =======================
// Error Handler (ALWAYS LAST)
// =======================

app.use(errorHandler);


// =======================
// Database + Server
// =======================

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});