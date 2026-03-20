with open('routes/orderRoutes.js', 'r') as f:
    content = f.read()

content = content.replace(
    'router.post("/", createOrder);',
    'router.post("/", protect, createOrder);'
)

with open('routes/orderRoutes.js', 'w') as f:
    f.write(content)
print("Fixed!")
print(open('routes/orderRoutes.js').read())
