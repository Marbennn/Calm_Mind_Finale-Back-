import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "professor", "superadmin"],
      default: "user",
    },
    profileCompleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetCode: String,
    resetCodeExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return token;
};

userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

userSchema.methods.generateResetCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetCode = code;
  this.resetCodeExpire = Date.now() + 10 * 60 * 1000;
  return code;
};

userSchema.methods.isResetTokenValid = function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return (
    hashedToken === this.resetPasswordToken &&
    this.resetPasswordExpire > Date.now()
  );
};

export default mongoose.model("User", userSchema);
