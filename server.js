require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors"); // Sirf ek baar rakha hai

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
const {swaggerUi, swaggerSpec} = require("./docs/swagger");

// =======================
// Middleware (CORS sabse upar)
// =======================

app.use(express.json());
app.use(helmet());

app.use(cors({
    origin: function (origin, callback) {
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.options('*', cors());

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
// API Routes
// =======================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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