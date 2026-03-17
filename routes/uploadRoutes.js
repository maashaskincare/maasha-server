import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
const router = express.Router();
router.post("/single", protect, adminOnly, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: req.file.path, publicId: req.file.filename });
});
router.post("/multiple", protect, adminOnly, upload.array("images", 5), (req, res) => {
  if (!req.files) return res.status(400).json({ message: "No files uploaded" });
  const files = req.files.map(f => ({ url: f.path, publicId: f.filename }));
  res.json(files);
});
export default router;