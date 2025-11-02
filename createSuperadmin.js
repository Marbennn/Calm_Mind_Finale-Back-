import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./src/modules/auth/model/user.model.js"; // adjust path

dotenv.config();

const createSuperadmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: "izamakikun2@gmail.com" });
    if (existing) {
      console.log("Superadmin already exists ✅");
      process.exit(0);
    }

    

    const superadmin = new User({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: "SuperSecure123",
      role: "superadmin",
      isVerified: true,
    });

    await superadmin.save();
    console.log("✅ Superadmin created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error creating superadmin:", err);
    process.exit(1);
  }
};

createSuperadmin();
