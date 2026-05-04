const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


const app = express();   // ✅ ALWAYS first

// Middleware
app.use(cors());
app.use(express.json());

console.log("🔥 THIS IS THE SERVER FILE RUNNING");

// Routes
const documentRoutes = require("./routes/document");
const uploadRoutes = require("./routes/upload");
const searchRoutes = require("./routes/search");
const chatRoutes = require("./routes/chat");

// Use routes
app.use("/api/docs", documentRoutes);
app.use("/api/docs", searchRoutes);   // ✅ search route here
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});