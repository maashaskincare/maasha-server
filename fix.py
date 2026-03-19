with open('controllers/productController.js', 'r') as f:
    content = f.read()

old_line = "    if (category) query.category = category;"

new_lines = """    if (category) {
      try {
        const { default: Category } = await import('../models/Category.js');
        const cat = await Category.findOne({ slug: category });
        if (cat) query.category = cat._id;
        else query.category = category;
      } catch(e) { query.category = category; }
    }"""

content = content.replace(old_line, new_lines)

with open('controllers/productController.js', 'w') as f:
    f.write(content)

print("Done! Check:")
# verify
idx = content.find("if (category)")
print(content[idx:idx+200])
