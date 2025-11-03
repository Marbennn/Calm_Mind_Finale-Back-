import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/auth/model/user.model.js";

dotenv.config();

const DEPARTMENTS = ['CITE','CEA','CELA','CCJE','CAHS','CMA'];
const YEAR_LEVELS = ['1st Year','2nd Year','3rd Year','4th Year'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pad(n, len) { return n.toString().padStart(len, '0'); }
function generateStudentNumber() {
  const part1 = pad(Math.floor(Math.random() * 10000), 4);
  const part2 = pad(Math.floor(Math.random() * 1000000), 6);
  return `${part1}-${part2}`;
}

async function fixAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find student-role users
    const students = await User.find({ role: 'student' }).lean();
    console.log(`Found ${students.length} users with role='student'`);

    let updated = 0;
    for (const s of students) {
      const needsNumber = !s.studentNumber || !/^\d{4}-\d{6}$/.test(String(s.studentNumber));
      const needsYear = !s.yearLevel || String(s.yearLevel).trim() === '';
      const needsDept = !s.department || String(s.department).trim() === '';

      if (!needsNumber && !needsYear && !needsDept) continue;

      const update = {};
      if (needsNumber) update.studentNumber = generateStudentNumber();
      if (needsYear) update.yearLevel = rand(YEAR_LEVELS);
      if (needsDept) update.department = rand(DEPARTMENTS);

      await User.updateOne({ _id: s._id }, { $set: update });
      updated++;
    }

    console.log(`✅ Updated ${updated} student records`);
    process.exit(0);
  } catch (err) {
    console.error('Error fixing records:', err);
    process.exit(1);
  }
}

fixAll();
