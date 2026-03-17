import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendOrderConfirmation = async (to, order) => {
  const itemsList = order.items
    .map((i) => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td></tr>`)
    .join("");

  await transporter.sendMail({
    from: `"Maasha Skin Care" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Order Confirmed #${order.orderNumber}`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#2D5A27">Thank you for your order!</h2>
        <p>Hi ${order.userName}, your order has been confirmed.</p>
        <p><strong>Order ID:</strong> #${order.orderNumber}</p>
        <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse">
          <tr style="background:#2D5A27;color:white"><th>Product</th><th>Qty</th><th>Price</th></tr>
          ${itemsList}
        </table>
        <p><strong>Total: ₹${order.total}</strong></p>
        <p>We'll notify you when your order is shipped.</p>
        <p style="color:#2D5A27">— Team Maasha Skin Care</p>
      </div>
    `,
  });
};

export const sendStatusUpdate = async (to, order) => {
  await transporter.sendMail({
    from: `"Maasha Skin Care" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Order #${order.orderNumber} — Status Updated to ${order.status}`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:auto">
        <h2 style="color:#2D5A27">Order Update</h2>
        <p>Your order <strong>#${order.orderNumber}</strong> status is now: <strong>${order.status}</strong></p>
        <p>Thank you for shopping with Maasha Skin Care!</p>
      </div>
    `,
  });
};