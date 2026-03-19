import Product from "../models/Product.js";
import slugify from "slugify";

// ─────────────────────────────────────────────
// 🛡️ Helper: Sanitize incoming product data
// Ensures string fields are never saved as arrays
// and array fields are never saved as plain strings
// ─────────────────────────────────────────────
const sanitizeProductData = (data) => {
  const sanitized = { ...data };

  // Fields that MUST be plain strings — convert array → string
  const stringFields = ["ingredients", "howToUse", "shortDescription", "description", "seoTitle", "seoDescription", "seoKeywords", "name", "sku"];
  stringFields.forEach((field) => {
    if (Array.isArray(sanitized[field])) {
      sanitized[field] = sanitized[field].join(", ");
    }
  });

  // Fields that MUST be arrays — convert comma string → array
  const arrayFields = ["skinTypes", "tags"];
  arrayFields.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitized[field]
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    // If already array, clean up empty values
    if (Array.isArray(sanitized[field])) {
      sanitized[field] = sanitized[field].map((v) => v.trim()).filter(Boolean);
    }
  });

  // Ensure price fields are numbers
  ["price", "comparePrice", "stock"].forEach((field) => {
    if (sanitized[field] !== undefined && sanitized[field] !== "") {
      sanitized[field] = Number(sanitized[field]);
    }
  });

  // Ensure booleans are actual booleans (forms sometimes send "true"/"false" strings)
  ["featured", "bestSeller"].forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitized[field] === "true";
    }
  });

  return sanitized;
};

// ─────────────────────────────────────────────
// GET all products (public, with filters)
// ─────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const {
      category, skinType, minPrice, maxPrice,
      sort, search, page = 1, limit = 12,
    } = req.query;

    const query = { status: "published" };

    if (category) {
      try {
        const { default: Category } = await import('../models/Category.js');
        const cat = await Category.findOne({ slug: category });
        if (cat) query.category = cat._id;
        else query.category = category;
      } catch(e) { query.category = category; }
    }
    if (skinType) query.skinTypes = skinType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { "ratings.average": -1 },
    };

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET single product by slug (public)
// ─────────────────────────────────────────────
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "published",
    }).populate("category", "name slug");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET featured products (public)
// ─────────────────────────────────────────────
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      featured: true,
      status: "published",
    }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET best sellers (public)
// ─────────────────────────────────────────────
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({
      bestSeller: true,
      status: "published",
    }).limit(6);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// CREATE product (admin)
// ─────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const sanitized = sanitizeProductData(req.body);

    // Auto-generate slug from name
    const slug = slugify(sanitized.name, { lower: true, strict: true });

    // Handle images from body (pre-uploaded via /api/upload/single)
    const images = req.body.images
      ? (Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images))
      : [];

    // Check for duplicate slug
    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        message: `A product with the slug "${slug}" already exists. Please use a unique product name.`,
      });
    }

    const product = await Product.create({ ...sanitized, slug, images });

    res.status(201).json(product);
  } catch (err) {
    // Return validation errors clearly
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE product (admin)
// ─────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const sanitized = sanitizeProductData(req.body);

    // If name changed, regenerate slug
    if (sanitized.name) {
      sanitized.slug = slugify(sanitized.name, { lower: true, strict: true });
    }

    // If new images uploaded, append to existing
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
      const existing = await Product.findById(req.params.id);
      sanitized.images = [...(existing?.images || []), ...newImages];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      sanitized,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE product (admin)
// ─────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET all products for admin panel (admin)
// ─────────────────────────────────────────────
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};