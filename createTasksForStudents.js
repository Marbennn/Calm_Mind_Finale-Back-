import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/auth/model/user.model.js';
import Task from './src/modules/tasks/model/tasks.model.js';

dotenv.config();

const STATUS = ['todo','in_progress','missing','completed'];
const PRIORITIES = ['Low','Medium','High'];
const TITLES = [
  'Finish assignment','Write report','Prepare presentation','Study chapter','Complete lab work','Review notes','Group meeting prep','Submit form','Research topic','Update portfolio'
];

function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
function rndInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}

function addDays(date, days){
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function run() {
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await User.find({ role: 'student' }).lean();
    console.log(`Found ${students.length} student users`);

    let created = 0;
    for(const s of students){
      const taskCount = rndInt(1,7);
      for(let i=0;i<taskCount;i++){
        const status = rand(STATUS);
        let dueDate = new Date();
        let completed = false;
        if(status === 'missing'){
          // overdue by 1..10 days
          dueDate = addDays(new Date(), -rndInt(1,10));
        } else if(status === 'completed'){
          completed = true;
          dueDate = addDays(new Date(), -rndInt(1,30));
        } else {
          // todo or in_progress -> due in next 1..14 days
          dueDate = addDays(new Date(), rndInt(1,14));
        }

        const title = `${rand(TITLES)} (${rndInt(1,999)})`;
        const priority = rand(PRIORITIES);

        const t = new Task({
          user_id: String(s._id),
          title,
          description: 'Auto-generated task',
          priority,
          start_date: new Date(),
          due_date: dueDate,
          status,
          completed,
          tags: ['auto-generated']
        });

        await t.save();
        created++;
      }
    }

    console.log(`Created ${created} tasks for ${students.length} students`);
    process.exit(0);
  }catch(err){
    console.error('Error creating tasks:', err);
    process.exit(1);
  }
}

run();
