import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String, image: String, price: Number, qty: Number,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  guestInfo: { name: String, email: String, phone: String },
  items: [orderItemSchema],
  shippingAddress: { name: String, phone: String, street: String, city: String, state: String, pincode: String },
  paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "razorpay" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  subtotal: Number,
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: Number,
  couponCode: String,
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  statusHistory: [{ status: String, timestamp: Date, note: String }],
  notes: String,
}, { timestamps: true });

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = 1000 + count + 1;
  }
  next();
});

export default mongoose.model("Order", orderSchema);