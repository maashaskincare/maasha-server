with open('models/User.js', 'r') as f:
    content = f.read()

content = content.replace(
    'phone: { type: String },',
    'phone: { type: String, required: true },'
)

with open('models/User.js', 'w') as f:
    f.write(content)
print("Fixed!")
