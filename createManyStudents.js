import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/auth/model/user.model.js";

dotenv.config();

const FIRST_NAMES = [
  'Alex','Sam','Jamie','Taylor','Jordan','Casey','Morgan','Riley','Avery','Quinn',
  'Cameron','Drew','Hayden','Parker','Rowan','Skyler','Sydney','Logan','Elliot','Reese'
];
const LAST_NAMES = [
  'Garcia','Smith','Johnson','Brown','Jones','Miller','Davis','Rodriguez','Martinez','Hernandez',
  'Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee'
];
const DEPARTMENTS = ['CITE','CEA','CELA','CCJE','CAHS','CMA'];
const YEAR_LEVELS = ['1st Year','2nd Year','3rd Year','4th Year'];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n, len) {
  return n.toString().padStart(len, '0');
}

function generateStudentNumber() {
  const part1 = pad(Math.floor(Math.random() * 10000), 4);
  const part2 = pad(Math.floor(Math.random() * 1000000), 6);
  return `${part1}-${part2}`;
}

async function createMany(count = 100) {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    let created = 0;
    for (let i = 0; i < count; i++) {
      const firstName = rand(FIRST_NAMES);
      const lastName = rand(LAST_NAMES);
      const studentNumber = generateStudentNumber();
      const yearLevel = rand(YEAR_LEVELS);
      const department = rand(DEPARTMENTS);

      // create unique email using student number and index
      const emailLocal = `student.${studentNumber.replace(/-/g,'')}.${i}`;
      const email = `${emailLocal}@school.local`;

      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`Skipping existing: ${email}`);
        continue;
      }

      const user = new User({
        firstName,
        lastName,
        email,
        password: 'passowrd123',
        role: 'student',
        isVerified: true,
        studentNumber,
        yearLevel,
        department,
      });

      await user.save();
      created++;
      if (created % 10 === 0) console.log(`Created ${created} users...`);
    }

    console.log(`✅ Done. Created ${created} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating students:', err);
    process.exit(1);
  }
}

// Run with: node createManyStudents.js 100
const arg = parseInt(process.argv[2], 10);
createMany(arg && arg > 0 ? arg : 100);
