import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String },
  excerpt: String,
  featuredImage: { url: String, publicId: String },
  category: String,
  tags: [String],
  toc: [{ id: String, text: String, level: Number }],
  seoTitle: String,
  seoDescription: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["published", "draft"], default: "draft" },
  publishedAt: Date,
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);