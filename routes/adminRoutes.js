import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
const router = express.Router();
router.get("/customers", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put("/customers/:id/block", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.json({ message: "User blocked", user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
export default router;