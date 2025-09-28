const mongoose = require("mongoose");
require("dotenv").config();

async function fixDatabaseIndexes() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    console.log("🔍 Checking existing indexes...");
    const indexes = await collection.indexes();
    console.log(
      "Current indexes:",
      indexes.map((idx) => idx.name),
    );

    // Check if username_1 index exists
    const usernameIndex = indexes.find((idx) => idx.name === "username_1");

    if (usernameIndex) {
      console.log("🗑️ Dropping problematic username_1 index...");
      await collection.dropIndex("username_1");
      console.log("✅ Successfully dropped username_1 index");
    } else {
      console.log("ℹ️ username_1 index not found - already removed");
    }

    // Verify the fix
    const updatedIndexes = await collection.indexes();
    console.log(
      "Updated indexes:",
      updatedIndexes.map((idx) => idx.name),
    );

    console.log("🎉 Database index fix completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing database indexes:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixDatabaseIndexes();
}

module.exports = { fixDatabaseIndexes };
