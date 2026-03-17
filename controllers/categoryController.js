import Category from "../models/Category.js";
import slugify from "slugify";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, seoTitle, seoDescription } = req.body;
    const slug = slugify(name, { lower: true });
    const image = req.file ? { url: req.file.path, publicId: req.file.filename } : {};
    const category = await Category.create({ name, slug, description, image, seoTitle, seoDescription });
    res.status(201).json(category);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};