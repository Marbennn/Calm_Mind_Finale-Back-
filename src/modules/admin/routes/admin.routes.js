// src/modules/admin/routes/admin.routes.js
import express from 'express';
import { getAnalytics } from '../../controller/admin.controller.js';
import { getStudentsByDepartment } from '../../controller/admin.analytics.controller.js';
import { authenticateToken, authorizeRole } from '../../../middleware/auth.js';

// lazy import to avoid circulars when not needed
import User from '../../auth/model/user.model.js';
import mongoose from 'mongoose';
import GetStartedProfile from '../../getStarted/model/getStarted.model.js';

const router = express.Router();

// POST /api/admin/analytics (auth + role)
router.post(
  '/analytics',
  authenticateToken,
  authorizeRole(['admin', 'superadmin']),
  getAnalytics
);

// GET /api/admin/students/by-department
router.get(
  '/students/by-department',
  authenticateToken,
  authorizeRole(['admin', 'superadmin']),
  getStudentsByDepartment
);

// GET /api/admin/users -> wrapper returning { users: [...] }
router.get(
  '/users',
  authenticateToken,
  authorizeRole(['admin', 'superadmin']),
  async (req, res) => {
    try {
      const users = await User.find().select('_id firstName lastName email role').lean();
      return res.json({ users });
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
  }
);

export default router;
// Additional admin-only profile endpoints

// GET /api/admin/profiles/:userId -> { data: { userId: {_id,email}, fullName, department, yearLevel, studentNumber } }
router.get(
  '/profiles/:userId',
  authenticateToken,
  authorizeRole(['admin', 'superadmin']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const objectId = new mongoose.Types.ObjectId(userId);
      const user = await User.findById(objectId).select('_id email firstName lastName').lean();
      if (!user) return res.status(404).json({ message: 'User not found' });

      const profile = await GetStartedProfile.findOne({ userId: objectId }).lean();
      if (!profile) return res.status(404).json({ message: 'Profile not found' });

      const data = {
        userId: { _id: user._id, email: user.email },
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        department: profile.department,
        yearLevel: profile.yearLevel,
        studentNumber: profile.studentNumber,
      };
      return res.status(200).json({ data });
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
  }
);

// POST /api/admin/profiles/batch -> { profiles: [ { userId, fullName, department, yearLevel, studentNumber } ] }
router.post(
  '/profiles/batch',
  authenticateToken,
  authorizeRole(['admin', 'superadmin']),
  async (req, res) => {
    try {
      const { ids } = req.body || {};
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'ids array is required' });
      }
      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      const users = await User.find({ _id: { $in: objectIds } }).select('_id email firstName lastName').lean();
      const profiles = await GetStartedProfile.find({ userId: { $in: objectIds } }).lean();

      const userMap = new Map(users.map((u) => [String(u._id), u]));
      const results = profiles.map((p) => {
        const u = userMap.get(String(p.userId));
        return {
          userId: String(p.userId),
          fullName: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '',
          department: p.department,
          yearLevel: p.yearLevel,
          studentNumber: p.studentNumber,
          // include live stress fields when available so admin UI can show current stress
          stressLevel: p.stressLevel || null,
          stressPercentage: p.stressPercentage || null,
          stressMetrics: p.stressMetrics || null,
        };
      });
      return res.json({ profiles: results });
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching profiles batch', error: err.message });
    }
  }
);
