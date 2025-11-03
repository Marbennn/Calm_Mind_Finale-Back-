import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './src/modules/auth/model/user.model.js';

dotenv.config();

async function exportEmails() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const students = await User.find({ role: 'student' }).select('email studentNumber firstName lastName').lean();
    const lines = students.map(s => `${s.email}`);
    const outPath = './created_student_emails.txt';
    fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
    console.log(`Wrote ${lines.length} emails to ${outPath}`);
    // also print to stdout
    console.log('---EMAILS---');
    lines.forEach(l => console.log(l));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error exporting emails:', err);
    process.exit(1);
  }
}

exportEmails();
