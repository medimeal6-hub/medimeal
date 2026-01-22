const cron = require('node-cron');
const FoodPlan = require('../models/FoodPlan');
const FoodDiary = require('../models/FoodDiary');
const Meal = require('../models/Meal');
const User = require('../models/User');
const EmailLog = require('../models/EmailLog');
const ComplianceLog = require('../models/ComplianceLog');
const { sendDailyFoodAlertEmail } = require('../utils/mailer');

/**
 * Daily Food Alert Service
 * Runs at 7 AM every day
 * Compares diet plan with food diary
 * Sends alerts via email and creates dashboard notifications
 */
async function processDailyFoodAlerts() {
  try {
    console.log('🌅 Processing daily food alerts...');
    
    const today = new Date().toISOString().split('T')[0];
    const users = await User.find({ role: 'user', isActive: true });
    
    for (const user of users) {
      try {
        // Get today's diet plan
        const activePlan = await FoodPlan.findOne({
          patientId: user._id,
          isActive: true,
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: new Date() } }
          ]
        });
        
        if (!activePlan) continue;
        
        // Get today's logged meals
        const todayFoodDiary = await FoodDiary.find({
          userId: user._id,
          date: today
        });
        
        const todayMeals = await Meal.find({
          userId: user._id,
          date: today
        });
        
        const alerts = {
          reminders: [],
          warnings: [],
          recommendations: []
        };
        
        // Check for missed meals
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const currentHour = new Date().getHours();
        
        mealTypes.forEach(mealType => {
          const isLogged = todayFoodDiary.some(fd => fd.mealType === mealType) ||
                          todayMeals.some(m => m.type === mealType);
          
          const mealTimes = { breakfast: 8, lunch: 13, dinner: 19 };
          const mealTime = mealTimes[mealType];
          
          // If meal time has passed and not logged
          if (currentHour >= mealTime && !isLogged) {
            const plannedMeal = activePlan[mealType] || [];
            if (plannedMeal.length > 0) {
              alerts.reminders.push(`You haven't logged your ${mealType} yet. Planned: ${plannedMeal.map(f => f.foodName).join(', ')}`);
            }
          }
          
          // If upcoming meal
          if (currentHour < mealTime && currentHour >= mealTime - 2) {
            const plannedMeal = activePlan[mealType] || [];
            if (plannedMeal.length > 0) {
              alerts.recommendations.push(`Upcoming ${mealType} recommendation: ${plannedMeal.map(f => f.foodName).join(', ')}`);
            }
          }
        });
        
        // Check for compliance conflicts
        const recentComplianceLogs = await ComplianceLog.find({
          userId: user._id,
          resolved: false,
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        
        if (recentComplianceLogs.length > 0) {
          recentComplianceLogs.forEach(log => {
            alerts.warnings.push(log.message);
          });
        }
        
        // Send email if there are any alerts
        if (alerts.reminders.length > 0 || alerts.warnings.length > 0 || alerts.recommendations.length > 0) {
          try {
            await sendDailyFoodAlertEmail(user.email, user.firstName, alerts);
            
            // Log email
            await EmailLog.create({
              userId: user._id,
              email: user.email,
              subject: 'Daily Food Alert - MediMeal',
              type: 'daily_food_alert',
              status: 'sent',
              metadata: { date: today, alertsCount: alerts.reminders.length + alerts.warnings.length + alerts.recommendations.length }
            });
            
            console.log(`✅ Sent daily food alert to ${user.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send alert to ${user.email}:`, emailError);
            
            // Log failed email
            await EmailLog.create({
              userId: user._id,
              email: user.email,
              subject: 'Daily Food Alert - MediMeal',
              type: 'daily_food_alert',
              status: 'failed',
              errorMessage: emailError.message
            });
          }
        }
      } catch (userError) {
        console.error(`Error processing alerts for user ${user._id}:`, userError);
      }
    }
    
    console.log('✅ Daily food alerts processing completed');
  } catch (error) {
    console.error('❌ Daily food alert service error:', error);
  }
}

function startDailyFoodAlertScheduler() {
  // Run at 7 AM every day
  cron.schedule('0 7 * * *', async () => {
    await processDailyFoodAlerts();
  });
  
  console.log('⏰ Daily food alert scheduler started (runs at 7 AM daily)');
}

module.exports = {
  processDailyFoodAlerts,
  startDailyFoodAlertScheduler
};
