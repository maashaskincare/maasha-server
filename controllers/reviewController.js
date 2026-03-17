import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
    if (alreadyReviewed) return res.status(400).json({ message: "Already reviewed this product" });
    const deliveredOrder = await Order.findOne({ user: req.user._id, status: "delivered", "items.product": productId });
    const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment, verifiedPurchase: !!deliveredOrder });
    const reviews = await Review.find({ product: productId, approved: true });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { "ratings.average": avg.toFixed(1), "ratings.count": reviews.length });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, approved: true }).populate("user", "name").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user", "name").populate("product", "name");
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};