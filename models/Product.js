import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true },
    shortDescription: { type: String, trim: true },
    description:      { type: String, trim: true },

    // ✅ ingredients stays a plain String — sanitizeProductData handles conversion
    ingredients: {
      type: String,
      trim: true,
      set: (v) => (Array.isArray(v) ? v.join(", ") : v), // last-line defence
    },

    howToUse: { type: String, trim: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    images: [{ url: String, publicId: String }],

    price:        { type: Number, required: true },
    comparePrice: { type: Number },

    sku:   { type: String, trim: true },
    stock: { type: Number, default: 0 },

    // ✅ skinTypes & tags stay arrays — sanitizeProductData handles conversion
    skinTypes: [{ type: String, trim: true }],
    tags:      [{ type: String, trim: true }],

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
    },

    featured:   { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },

    seoTitle:       { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords:    { type: String, trim: true },

    status: {
      type:    String,
      enum:    ["published", "draft", "archived"],
      default: "published",
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
// Index for faster search queries
// ─────────────────────────────────────────────
productSchema.index({ name: "text", tags: "text" });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ category: 1 });

export default mongoose.model("Product", productSchema);