import mongoose from "mongoose";
import User from "../auth/model/user.model.js";
import GetStartedProfile from "../getStarted/model/getStarted.model.js";

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(objectId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const profile = await GetStartedProfile.findOne({
      userId: objectId,
    }).lean();
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const data = {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      department: profile.department,
      yearLevel: profile.yearLevel,
      course: profile.course,
      studentNumber: profile.studentNumber,
      profileImage: profile.profileImage
        ? `${req.protocol}://${req.get("host")}/${profile.profileImage.replace(
            /\\/g,
            "/"
          )}`
        : null,
      userId: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    };

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      department,
      yearLevel,
      course,
      studentNumber,
    } = req.body;

    const objectId = new mongoose.Types.ObjectId(userId);

    const profileImage = req.file
      ? req.file.path.replace(/\\/g, "/")
      : req.body.profileImage || null;

    const updatedUser = await User.findByIdAndUpdate(
      objectId,
      {
        firstName,
        lastName,
        profileCompleted: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updatedProfile = await GetStartedProfile.findOneAndUpdate(
      { userId: objectId },
      {
        department,
        yearLevel,
        course,
        studentNumber,
        ...(profileImage && { profileImage }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const data = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      department: updatedProfile.department,
      yearLevel: updatedProfile.yearLevel,
      course: updatedProfile.course,
      studentNumber: updatedProfile.studentNumber,
      profileImage: updatedProfile.profileImage
        ? `${req.protocol}://${req.get("host")}/${updatedProfile.profileImage}`
        : null,
      userId: {
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
