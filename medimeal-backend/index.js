const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Connect to MongoDB (only once, using db.js)
connectDB();

// Routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("MediMeal API Running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);