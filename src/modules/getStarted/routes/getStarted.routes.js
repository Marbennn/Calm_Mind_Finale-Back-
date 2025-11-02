import express from "express";
import {
  upload,
  createProfile,
  getProfileByStudentNumber,
  getProfileByUserId,
  updateProfile,
  updatePassword,
} from "../../controller/getStarted.controller.js";

import { authenticateToken, authorizeRole } from "../../../utils/jwt.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole(["user"]),
  upload.single("profileImage"),
  createProfile
);

router.get("/:studentNumber", authenticateToken, getProfileByStudentNumber);
router.get("/user/:userId", authenticateToken, getProfileByUserId);
router.put(
  "/update-profile/:userId",
  authenticateToken,
  authorizeRole(["user"]),
  upload.single("profileImage"),
  updateProfile
);

router.put(
  "/update-password/:userId",
  authenticateToken,
  authorizeRole(["user"]),
  updatePassword
);

export default router;
