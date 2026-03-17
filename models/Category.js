import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  image: { url: String, publicId: String },
  description: String,
  seoTitle: String,
  seoDescription: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);