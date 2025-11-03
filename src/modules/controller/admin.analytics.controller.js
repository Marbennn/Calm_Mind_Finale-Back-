import User from "../auth/model/user.model.js";
import GetStartedProfile from "../getStarted/model/getStarted.model.js";

export async function getStudentsByDepartment(req, res) {
  try {
    // Find all student profiles
    const profiles = await GetStartedProfile.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: "$_id",
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { department: 1 }
      }
    ]);

    // Transform the data for the frontend chart
    const chartData = {
      labels: profiles.map(p => p.department),
      datasets: [{
        data: profiles.map(p => p.count),
        backgroundColor: [
          '#4B0082', // Indigo
          '#800080', // Purple
          '#9370DB', // Medium Purple
          '#9932CC', // Dark Orchid
          '#8B008B', // Dark Magenta
          '#9400D3', // Dark Violet
          '#BA55D3', // Medium Orchid
          '#DA70D6', // Orchid
          '#EE82EE', // Violet
          '#DDA0DD'  // Plum
        ]
      }]
    };

    return res.status(200).json(chartData);
  } catch (err) {
    console.error("Error fetching students by department:", err);
    return res.status(500).json({ error: "Server error" });
  }
}