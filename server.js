import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
dotenv.config();
connectDB();
const app = express();
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://maashaskincare.com",
      "https://www.maashaskincare.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://maasha-client.onrender.com",
      "https://maasha-client.vercel.app",
      process.env.FRONTEND_URL,
    ];
    if (!origin) return callback(null, true);
    if (origin.includes(".app.github.dev")) return callback(null, true);
    if (origin.includes(".onrender.com"))   return callback(null, true);
    if (origin.includes(".vercel.app"))     return callback(null, true);
    if (allowedOrigins.includes(origin))    return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.get("/", (req, res) => res.json({ message: "Maasha Skin Care API is running!", version: "1.0.0" }));
app.use("/api/auth",       authRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/blogs",      blogRoutes);
app.use("/api/reviews",    reviewRoutes);
app.use("/api/coupons",    couponRoutes);
app.use("/api/banners",    bannerRoutes);
app.use("/api/upload",     uploadRoutes);
app.use("/api/admin",      adminRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
