import Blog from "../models/Blog.js";
import slugify from "slugify";

export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9, category } = req.query;
    const query = { status: "published" };
    if (category) query.category = category;
    const blogs = await Blog.find(query).select("title slug excerpt featuredImage category tags publishedAt").sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Blog.countDocuments(query);
    res.json({ blogs, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" }).populate("author", "name");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createBlog = async (req, res) => {
  try {
    const { title } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const featuredImage = req.file ? { url: req.file.path, publicId: req.file.filename } : {};
    const blog = await Blog.create({ ...req.body, slug, featuredImage, author: req.user._id, publishedAt: req.body.status === "published" ? new Date() : null });
    res.status(201).json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate("author", "name");
    res.json(blogs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};