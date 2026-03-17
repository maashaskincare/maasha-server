import Product from "../models/Product.js";
import slugify from "slugify";

export const getProducts = async (req, res) => {
  try {
    const { category, skinType, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;
    const query = { status: "published" };
    if (category) query.category = category;
    if (skinType) query.skinTypes = skinType;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { tags: { $regex: search, $options: "i" } }];
    const sortOptions = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { "ratings.average": -1 } };
    const products = await Product.find(query).populate("category", "name slug").sort(sortOptions[sort] || { createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: "published" }).populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true, status: "published" }).limit(8);
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ bestSeller: true, status: "published" }).limit(6);
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createProduct = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const images = req.files ? req.files.map(f => ({ url: f.path, publicId: f.filename })) : [];
    const product = await Product.create({ ...req.body, slug, images });
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name").sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};