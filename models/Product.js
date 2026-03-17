import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  shortDescription: { type: String },
  description: { type: String },
  ingredients: { type: String },
  howToUse: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: [{ url: String, publicId: String }],
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  sku: { type: String },
  stock: { type: Number, default: 0 },
  skinTypes: [String],
  tags: [String],
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  featured: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: String,
  status: { type: String, enum: ["published", "draft", "archived"], default: "published" },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);