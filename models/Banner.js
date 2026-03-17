import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: String, subtitle: String,
  image: { url: String, publicId: String },
  link: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);