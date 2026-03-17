import Order from "../models/Order.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendOrderConfirmation, sendStatusUpdate } from "../utils/email.js";

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, discount, shipping, total, couponCode, guestInfo } = req.body;
    const razorpayOrder = paymentMethod === "razorpay"
      ? await getRazorpay().orders.create({ amount: total * 100, currency: "INR", receipt: `order_${Date.now()}` })
      : null;
    const order = await Order.create({ user: req.user?._id, guestInfo, items, shippingAddress, paymentMethod, subtotal, discount, shipping, total, couponCode, razorpayOrderId: razorpayOrder?.id, statusHistory: [{ status: "pending", timestamp: new Date() }] });
    res.status(201).json({ order, razorpayOrderId: razorpayOrder?.id, razorpayKeyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");
    if (expectedSign !== razorpaySignature) return res.status(400).json({ message: "Invalid payment signature" });
    const order = await Order.findByIdAndUpdate(orderId, { paymentStatus: "paid", razorpayPaymentId, status: "processing", $push: { statusHistory: { status: "processing", timestamp: new Date() } } }, { new: true });
    const UserModel = (await import("../models/User.js")).default;
    const email = order.user ? await UserModel.findById(order.user).then(u => u?.email) : order.guestInfo?.email;
    if (email) await sendOrderConfirmation(email, order);
    res.json({ message: "Payment verified", order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).populate("user", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, $push: { statusHistory: { status, timestamp: new Date(), note } } }, { new: true }).populate("user", "email name");
    if (order.user?.email) await sendStatusUpdate(order.user.email, order);
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]);
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");
    const weeklyRevenue = await Order.aggregate([{ $match: { paymentStatus: "paid", createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }, { $group: { _id: { $dayOfWeek: "$createdAt" }, revenue: { $sum: "$total" } } }, { $sort: { _id: 1 } }]);
    res.json({ totalOrders, totalRevenue: totalRevenue[0]?.total || 0, pendingOrders, recentOrders, weeklyRevenue });
  } catch (err) { res.status(500).json({ message: err.message }); }
};