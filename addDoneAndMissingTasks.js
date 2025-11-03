import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/auth/model/user.model.js';
import Task from './src/modules/tasks/model/tasks.model.js';

dotenv.config();

const TITLES = [
  'Finalize report','Submit assignment','Complete lab','Finish slides','Draft essay','Wrap up project','Turn in quiz','Prepare summary'
];
const PRIORITIES = ['Low','Medium','High'];

function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
function rndInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function addDays(date, days){const d=new Date(date); d.setDate(d.getDate()+days); return d;}

async function run(){
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await User.find({ role: 'student' }).lean();
    console.log(`Found ${students.length} student users`);

    let createdDone=0;
    let createdMissing=0;

    for(const s of students){
      const nDone = rndInt(1,6);
      const nMissing = rndInt(1,7);

      // create completed tasks
      for(let i=0;i<nDone;i++){
        const t = new Task({
          user_id: String(s._id),
          title: `${rand(TITLES)} (done ${i+1})`,
          description: 'Auto-created completed task',
          priority: rand(PRIORITIES),
          start_date: new Date(),
          due_date: addDays(new Date(), -rndInt(1,30)),
          status: 'completed',
          completed: true,
          tags: ['auto-done']
        });
        await t.save();
        createdDone++;
      }

      // create missing (overdue) tasks
      for(let j=0;j<nMissing;j++){
        const t = new Task({
          user_id: String(s._id),
          title: `${rand(TITLES)} (missing ${j+1})`,
          description: 'Auto-created missing/overdue task',
          priority: rand(PRIORITIES),
          start_date: new Date(),
          due_date: addDays(new Date(), -rndInt(1,20)),
          status: 'missing',
          completed: false,
          tags: ['auto-missing']
        });
        await t.save();
        createdMissing++;
      }
    }

    console.log(`Created ${createdDone} completed tasks and ${createdMissing} missing tasks for ${students.length} students`);
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
