import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/auth/model/user.model.js";

dotenv.config();

const createStudentUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    const email = process.argv[2] || "student@example.com";
    const firstName = process.argv[3] || "Student";
    const lastName = process.argv[4] || "User";
    const password = process.argv[5] || "Student123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`User with email ${email} already exists ✅`);
      process.exit(0);
    }

    const student = new User({
      firstName,
      lastName,
      email,
      password,
      role: "user",
      isVerified: true,
    });

    await student.save();
    console.log(`✅ Student user created: ${email} (password: ${password})`);
    process.exit(0);
  } catch (err) {
    console.error("Error creating student user:", err);
    process.exit(1);
  }
};

createStudentUser();
