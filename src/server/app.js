require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subcategoryRoutes = require("./routes/subcategoryRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || false,
    credentials: true,
  }),
);
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (err) {
    console.error("DB connect middleware error:", err);
    return res.status(500).json({ message: "Database connection error" });
  }
});

app.use("/", userRoutes);
app.use("/", categoryRoutes);
app.use("/", subcategoryRoutes);
app.use("/", itemRoutes);

module.exports = app;
