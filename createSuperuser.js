// createSuperuser.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/auth/model/user.model.js"; // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in your .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Check if a superuser already exists
    const existing = await User.findOne({ email: "superuser@gmail.com" });
    if (existing) {
      console.log("⚠️ Superuser already exists:");
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
      console.log(`   Verified: ${existing.isVerified}`);
      process.exit(0);
    }

    // Create a verified superadmin
    const superuser = new User({
      firstName: "Super",
      lastName: "User",
      name: "Super User", // optional if your schema still has `name`
      email: "superuser@gmail.com",
      password: "qwerty123@", // will be hashed automatically
      role: "superadmin",
      isVerified: true,
      profileCompleted: true,
    });

    await superuser.save();

    console.log("\n✅ Superuser created successfully!");
    console.log(`   Email: ${superuser.email}`);
    console.log(`   Password: qwerty123@`);
    console.log(`   Role: ${superuser.role}`);
    console.log(`   Verified: ${superuser.isVerified}`);
    console.log(`   Profile Completed: ${superuser.profileCompleted}`);
    console.log(
      `   Password Hash Preview: ${superuser.password.slice(0, 20)}...`
    );

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error creating superuser:", err);
    process.exit(1);
  });
