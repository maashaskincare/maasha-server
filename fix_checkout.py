with open('src/pages/Checkout.jsx', 'r') as f:
    content = f.read()

# Fix the Razorpay initialization to match backend response
old = """      const { data } = await orderAPI.create(orderData)
      if (payMethod === 'cod') {
        dispatch(clearCart())
        navigate('/order-success', { state: { orderId: data.order._id, orderNumber: data.order.orderNumber } })
        return
      }
      const options = {
        key: RAZORPAY_KEY,
        amount: data.razorpayOrder.amount,
        currency: 'INR',
        name: BRAND.name,
        description: 'Maasha Skin Care Order',
        order_id: data.razorpayOrder.id,"""

new = """      const { data } = await orderAPI.create(orderData)
      if (payMethod === 'cod') {
        dispatch(clearCart())
        navigate('/order-success', { state: { orderId: data.order._id, orderNumber: data.order.orderNumber } })
        return
      }
      const options = {
        key: data.razorpayKeyId || RAZORPAY_KEY,
        amount: data.order.total * 100,
        currency: 'INR',
        name: BRAND.name,
        description: 'Maasha Skin Care Order',
        order_id: data.razorpayOrderId,"""

content = content.replace(old, new)

with open('src/pages/Checkout.jsx', 'w') as f:
    f.write(content)

print("Fixed!")
