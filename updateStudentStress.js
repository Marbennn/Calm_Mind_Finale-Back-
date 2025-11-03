import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/modules/auth/model/user.model.js';
import Task from './src/modules/tasks/model/tasks.model.js';
import GetStartedProfile from './src/modules/getStarted/model/getStarted.model.js';
import { calculateDailyStress } from './src/utils/stressCalculator.js';

dotenv.config();

async function updateStressLevels() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all students
        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students`);

        let updatedCount = 0;
        
        // Process each student
        for (const student of students) {
            try {
                // Get student's tasks
                const tasks = await Task.find({ user_id: student._id.toString() });
                console.log(`Found ${tasks.length} tasks for student ${student.studentNumber}`);
                
            // Get student's profile
            const profile = await GetStartedProfile.findOne({ userId: student._id });                if (!profile) {
                    console.log(`No profile found for student ${student.studentNumber}`);
                    continue;
                }

                // Calculate stress level
                const stressMetrics = calculateDailyStress(tasks);
                console.log(`Calculated stress metrics for ${student.studentNumber}:`, {
                    normalized: stressMetrics.normalized,
                    percentage: stressMetrics.percentage,
                    totalTasks: stressMetrics.metrics.totalTasks
                });
                
                // Update profile with new stress level
                await GetStartedProfile.findByIdAndUpdate(profile._id, {
                    stressLevel: stressMetrics.normalized,
                    stressPercentage: stressMetrics.percentage,
                    stressMetrics: stressMetrics
                });
                
                updatedCount++;
                console.log(`Updated stress level for student ${student.studentNumber}: ${stressMetrics.normalized}`);
            } catch (error) {
                console.error(`Error processing student ${student.studentNumber}:`, error);
            }
        }

        console.log(`Successfully updated stress levels for ${updatedCount} students`);
    } catch (error) {
        console.error('Error updating stress levels:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateStressLevels();