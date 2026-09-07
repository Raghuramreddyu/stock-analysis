from app.database.mongodb import users_collection


def migrate_user_ids():
    users = list(
        users_collection.find(
            {"user_id": {"$exists": False}},
            {"_id": 1, "name": 1, "email": 1, "role": 1}
        ).sort("_id", 1)
    )

    if not users:
        print("No users need migration.")
        return

    print(f"Found {len(users)} users without user_id.")

    next_user_id = 1

    for user in users:

        users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "user_id": next_user_id
                }
            }
        )

        print(
            f"Assigned user_id={next_user_id} "
            f"to {user['email']}"
        )

        next_user_id += 1

    print("User ID migration completed successfully.")


if __name__ == "__main__":
    migrate_user_ids()