import dotenv from 'dotenv';
import mongoose from 'mongoose';
import GetStartedProfile from './src/modules/getStarted/model/getStarted.model.js';

dotenv.config();

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const profiles = await GetStartedProfile.find().limit(20).select('userId studentNumber stressLevel stressPercentage').lean();
    console.log(`Found ${profiles.length} profiles (showing up to 20):`);
    profiles.forEach((p, i) => {
      console.log(i+1, {
        userId: String(p.userId),
        studentNumber: p.studentNumber,
        stressLevel: p.stressLevel,
        stressPercentage: p.stressPercentage
      });
    });
  } catch (err) {
    console.error('Error reading profiles:', err);
  } finally {
    await mongoose.disconnect();
  }
}

debug();