# Fix product routes
with open('routes/productRoutes.js', 'r') as f:
    content = f.read()
content = content.replace(
    'router.post("/", protect, adminOnly, upload.array("images", 5), createProduct);',
    'router.post("/", protect, adminOnly, createProduct);'
)
with open('routes/productRoutes.js', 'w') as f:
    f.write(content)
print("Product routes fixed!")

# Fix blog routes
with open('routes/blogRoutes.js', 'r') as f:
    content = f.read()
content = content.replace(
    'router.post("/", protect, adminOnly, upload.single("featuredImage"), createBlog);',
    'router.post("/", protect, adminOnly, createBlog);'
)
with open('routes/blogRoutes.js', 'w') as f:
    f.write(content)
print("Blog routes fixed!")

# Fix category routes too
with open('routes/categoryRoutes.js', 'r') as f:
    content = f.read()
content = content.replace(
    'router.post("/", protect, adminOnly, upload.single("image"), createCategory);',
    'router.post("/", protect, adminOnly, createCategory);'
)
with open('routes/categoryRoutes.js', 'w') as f:
    f.write(content)
print("Category routes fixed!")
