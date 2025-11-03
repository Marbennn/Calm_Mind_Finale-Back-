import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/auth/model/user.model.js';
import GetStartedProfile from './src/modules/getStarted/model/getStarted.model.js';

dotenv.config();

const DEPARTMENTS = ['CITE','CAHS','CEA','CCJE','CELA','CMA'];
const COURSE_MAP = {
  CITE: ['Bachelor of Science in Information Technology'],
  CAHS: [
    'Bachelor of Science in Nursing',
    'Bachelor of Science in Pharmacy',
    'Bachelor in Medical Laboratory Science',
    'Bachelor of Science in Psychology',
  ],
  CEA: [
    'Bachelor of Science in Architecture',
    'Bachelor of Science in Computer Engineering',
    'Bachelor of Science in Civil Engineering',
    'Bachelor of Science in Electrical Engineering',
    'Bachelor of Science in Mechanical Engineering',
  ],
  CCJE: ['Bachelor of Science in Criminology'],
  CELA: [
    'Bachelor of Arts in Political Science',
    'Bachelor of Science in Elementary Education',
    'Bachelor of Secondary Education Major in English',
    'Bachelor of Secondary Education Major in Math',
    'Bachelor of Secondary Education Major in Science',
    'Bachelor of Secondary Education Major in Social Studies',
  ],
  CMA: [
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Management Accounting',
    'Bachelor of Science in Accountancy Technology',
    'Bachelor of Science in Hospitality Management',
    'Bachelor of Science in Tourism Management',
    'Bachelor of Science in Business Administration Major in Marketing Management',
    'Bachelor of Science in Business Administration Major in Financial Management',
  ],
};
const YEAR_LEVELS = ['1st Year','2nd Year','3rd Year','4th Year'];

function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
function pad(n,len){return n.toString().padStart(len,'0');}
function generateStudentNumber(){
  const part1 = pad(Math.floor(Math.random()*10000),4);
  const part2 = pad(Math.floor(Math.random()*1000000),6);
  return `${part1}-${part2}`;
}

async function ensureUniqueStudentNumber(){
  for(;;){
    const sn = generateStudentNumber();
    const inProfile = await GetStartedProfile.findOne({ studentNumber: sn });
    const inUser = await User.findOne({ studentNumber: sn });
    if(!inProfile && !inUser) return sn;
  }
}

async function run(){
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} student users`);

    let created = 0;
    for(const user of students){
      const existingProfile = await GetStartedProfile.findOne({ userId: user._id });
      if(existingProfile){
        // ensure user's own fields are set
        let needUpdate = false;
        const upd = {};
        if((!user.studentNumber || !/^\d{4}-\d{6}$/.test(user.studentNumber)) && existingProfile.studentNumber){ upd.studentNumber = existingProfile.studentNumber; needUpdate = true; }
        if((!user.yearLevel || user.yearLevel.trim()==='') && existingProfile.yearLevel){ upd.yearLevel = existingProfile.yearLevel; needUpdate = true; }
        if((!user.department || user.department.trim()==='') && existingProfile.department){ upd.department = existingProfile.department; needUpdate = true; }
        if(needUpdate){ await User.updateOne({_id: user._id}, {$set: upd}); }
        continue;
      }

      // create profile
      const dept = rand(DEPARTMENTS);
      const course = rand(COURSE_MAP[dept]);
      const year = rand(YEAR_LEVELS);
      const studentNumber = await ensureUniqueStudentNumber();

      const profile = new GetStartedProfile({
        userId: user._id,
        department: dept,
        course: course,
        yearLevel: year,
        studentNumber: studentNumber,
        profileImage: '',
      });
      await profile.save();

      // backfill user fields if blank
      const updates = {};
      if(!user.studentNumber || !/^\d{4}-\d{6}$/.test(user.studentNumber)) updates.studentNumber = studentNumber;
      if(!user.yearLevel || user.yearLevel.trim()==='') updates.yearLevel = year;
      if(!user.department || user.department.trim()==='') updates.department = dept;
      if(Object.keys(updates).length) await User.updateOne({_id: user._id}, {$set: updates});

      created++;
    }

    console.log(`Created ${created} GetStarted profiles and backfilled user fields where needed.`);
    process.exit(0);
  }catch(err){
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
