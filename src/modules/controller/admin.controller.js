// src/modules/controller/admin.controller.js
import Task from "../tasks/model/tasks.model.js";
import { StressLog } from "../stress/model/stress.model.js";

export async function getAnalytics(req, res) {
  try {
    const { start, end, user_id } = req.body || {};

    // Build filters
    const userFilter = user_id ? { user_id } : {};

    // Tasks: fetch all tasks for the (optional) user
    const rawTasks = await Task.find(userFilter).lean();

    // Stress logs: optional date range by timestamp
    const stressFilter = { ...userFilter };
    if (start || end) {
      stressFilter.timestamp = {};
      if (start) stressFilter.timestamp.$gte = new Date(start);
      if (end) stressFilter.timestamp.$lte = new Date(end);
    }
    const rawStressLogs = await StressLog.find(stressFilter).sort({ timestamp: -1 }).lean();

    // Map to required response shape
    const tasks = rawTasks.map((t) => ({
      id: String(t._id),
      userId: t.user_id,
      priority: t.priority, // "High" | "Medium" | "Low"
      status: typeof t.status === 'string' ? t.status.toLowerCase() : t.status,
      dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : null, // YYYY-MM-DD
      completedAt: null, 
    }));

    const stressLogs = rawStressLogs.map((s) => ({
      userId: s.user_id,
      ts: s.timestamp ? new Date(s.timestamp).toISOString() : null,
      level: s.level,
      tags: s.tags || [],
    }));

    return res.status(200).json({ tasks, stressLogs });
  } catch (err) {
    console.error("Admin analytics error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
