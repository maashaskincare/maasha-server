with open('controllers/productController.js', 'r') as f:
    content = f.read()

# Fix: use images from req.body instead of req.files
old = """    // Handle uploaded images
    const images = req.files
      ? req.files.map((f) => ({ url: f.path, publicId: f.filename }))
      : [];"""

new = """    // Handle images from body (pre-uploaded via /api/upload/single)
    const images = req.body.images
      ? (Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images))
      : [];"""

content = content.replace(old, new)

with open('controllers/productController.js', 'w') as f:
    f.write(content)

print("Fixed!")
print("Verify:")
idx = content.find('Handle image')
print(content[idx:idx+200])
