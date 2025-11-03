import mongoose from "mongoose";

const getStartedProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: { type: String, required: true },
    course: { type: String, required: true },
    yearLevel: { type: String, required: true },
    studentNumber: { type: String, required: true, unique: true },
    profileImage: { type: String, default: "" },
    // Live/calculated stress fields (kept optional)
    stressLevel: { type: Number, default: null }, // normalized 1-5
    stressPercentage: { type: Number, default: null }, // 0-100
    stressMetrics: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("GetStartedProfile", getStartedProfileSchema);
