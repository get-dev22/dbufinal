/** @format */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const complaintRoutes = require("./routes/complaints");
const clubRoutes = require("./routes/clubs");
const electionRoutes = require("./routes/elections");
const postRoutes = require("./routes/posts");
const contactRoutes = require("./routes/contact");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const { createDefaultAdmin } = require("./utils/createAdmin");

const app = express();

// Security middleware
app.use(helmet());
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? ["https://your-frontend-domain.com"]
				: ["http://localhost:3000", "http://localhost:5173"],
		credentials: true,
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Static files
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/contact", contactRoutes);

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Error handling middleware
app.use(errorHandler);
console.log("MongoDB URI:", process.env.MONGODB_URI);
// Database connection
const connectDB = async () => {
	try {
		if (!process.env.MONGODB_URI) {
			throw new Error("MONGODB_URI is not defined in environment variables");
		}

		const conn = await mongoose.connect(process.env.MONGODB_URI);
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

		// Create default admin user
		await createDefaultAdmin();
	} catch (error) {
		console.error("❌ Database connection error:", error.message);
		process.exit(1);
	}
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
	await connectDB();

	app.listen(PORT, () => {
		console.log(
			`Server running in ${
				process.env.NODE_ENV || "development"
			} mode on port ${PORT}`
		);
	});
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`);
	process.exit(1);
});

module.exports = app;
