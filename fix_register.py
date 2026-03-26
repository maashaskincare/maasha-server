with open('controllers/authController.js', 'r') as f:
    content = f.read()

old = """export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, phone, password });"""

new = """export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    if (!email || !email.trim()) return res.status(400).json({ message: "Email is required" });
    if (!phone || !phone.trim()) return res.status(400).json({ message: "Phone number is required" });
    if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, phone, password });"""

content = content.replace(old, new)

with open('controllers/authController.js', 'w') as f:
    f.write(content)
print("Fixed!")
