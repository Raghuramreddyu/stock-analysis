from app.database.mongodb import users_collection
from app.services.auth_service import hash_password


admin_email = "admin@stockanalysis.com"
admin_password = "admin123"
admin_name = "Stock Admin"


existing_admin = users_collection.find_one(
    {"email": admin_email}
)

if existing_admin:
    print("Admin account already exists.")
else:
    users_collection.insert_one({
        "name": admin_name,
        "email": admin_email,
        "passwordHash": hash_password(admin_password),
        "role": "admin"
    })

    print("Admin account created successfully.")
    print("Email:", admin_email)
    print("Password:", admin_password)