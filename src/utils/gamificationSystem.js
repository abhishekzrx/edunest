import supabase from '../supabase/supabaseClient';
import { logActivity } from './dashboardCore';

export const getGamificationStats = (userId) => {
  const defaultStats = { streak: 0, accuracy: 0, points: 0, lastLogin: null, testsCompleted: 0, performanceHistory: [] };
  if (!userId) return defaultStats;
  
  const savedStr = localStorage.getItem(`gamification_${userId}`);
  if (!savedStr) return defaultStats;
  
  try {
    const stats = JSON.parse(savedStr);
    
    // Check missing daily streak
    const now = new Date();
    if (stats.lastLogin) {
       const last = new Date(stats.lastLogin);
       const diffTime = Math.abs(now - last);
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
       
       if (diffDays > 2) {
         // Streak broken
         stats.streak = 0;
       }
    }
    
    if(!stats.performanceHistory) stats.performanceHistory = [];
    
    return { ...defaultStats, ...stats };
  } catch(e) {
    return defaultStats;
  }
};

export const saveGamificationStats = async (userId, stats) => {
  if (!userId) return;
  // Local Save
  localStorage.setItem(`gamification_${userId}`, JSON.stringify(stats));
  
  // Remote Sync -> Push points and streak to Supabase Profiles for Global Leaderboard!
  try {
     const { error } = await supabase
       .from('profiles')
       .update({ points: stats.points, streak: stats.streak })
       .eq('id', userId);
       
     if (error) console.error("Failed to sync gamification stats to Supabase:", error.message);
  } catch (err) {
     console.error("Sync error:", err);
  }
};

export const updateDailyLogin = async (userId) => {
  const stats = getGamificationStats(userId);
  const now = new Date();
  
  // Calculate if it's a new day
  let incrementStreak = false;
  let isNewLogin = false;
  if (!stats.lastLogin) {
    incrementStreak = true;
    isNewLogin = true;
  } else {
    const last = new Date(stats.lastLogin);
    if (last.getDate() !== now.getDate() || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()) {
      incrementStreak = true;
      isNewLogin = true;
    }
  }

  if (incrementStreak) {
    stats.streak += 1;
    stats.points += 10; // Login bonus
    
    // Log Activity for daily login bonus
    await logActivity(userId, 'achievement', 'Daily Login Streak!', { points: 10, streak: stats.streak });
  }
  
  stats.lastLogin = now.toISOString();
  await saveGamificationStats(userId, stats);
  return stats;
};

export const awardTestPoints = async (userId, score, totalQuestions, chapterName) => {
  const stats = getGamificationStats(userId);
  
  // Points calculation logic
  const completionPoints = 10;
  const correctArrPoints = score * 5;
  const totalAwarded = completionPoints + correctArrPoints;
  
  stats.points += totalAwarded;
  stats.testsCompleted += 1;
  const sessionAccuracy = (score / totalQuestions) * 100;
  
  // Cumulative Accuracy calculation
  if (stats.testsCompleted === 1) {
    stats.accuracy = sessionAccuracy;
  } else {
    // Moving average approximation for stability
    stats.accuracy = ((stats.accuracy * (stats.testsCompleted - 1)) + sessionAccuracy) / stats.testsCompleted;
  }
  
  // Append to performance history
  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  stats.performanceHistory.push({
    testName: `Test ${stats.testsCompleted}`,
    date: today,
    accuracy: Math.round(sessionAccuracy)
  });
  
  // keep only the last 15 elements to avoid localstorage bloat
  if (stats.performanceHistory.length > 15) {
    stats.performanceHistory.shift();
  }

  await saveGamificationStats(userId, stats);
  
  // Log Activity for completing a test
  await logActivity(userId, 'mcq', `Completed ${chapterName || 'MCQ'} Practice`, { score, accuracy: Math.round(sessionAccuracy) });
  
  return { awarded: totalAwarded, newTotal: stats.points, streak: stats.streak };
};

// ==========================================
// Memory Reinforcement Engine
// ==========================================

export const getMistakes = (userId) => {
  if (!userId) return [];
  const mistakesStr = localStorage.getItem(`mistakes_${userId}`);
  if (!mistakesStr) return [];
  try {
    return JSON.parse(mistakesStr);
  } catch(e) {
    return [];
  }
};

export const saveMistake = (userId, missingQuestionObj) => {
  if (!userId || !missingQuestionObj) return;
  const mistakes = getMistakes(userId);
  
  // Prevent duplicate tracking
  const alreadyExists = mistakes.some(m => m.question === missingQuestionObj.question);
  if (!alreadyExists) {
    mistakes.push({
      ...missingQuestionObj,
      failedAt: new Date().toISOString()
    });
    localStorage.setItem(`mistakes_${userId}`, JSON.stringify(mistakes));
  }
};

export const removeMistake = (userId, questionText) => {
  if (!userId) return;
  const mistakes = getMistakes(userId);
  const filtered = mistakes.filter(m => m.question !== questionText);
  localStorage.setItem(`mistakes_${userId}`, JSON.stringify(filtered));
};

export const getRevisionQueue = (userId) => {
  const mistakes = getMistakes(userId);
  const now = new Date();
  
  // Filter questions failed more than 12 hours ago
  return mistakes.filter(m => {
    const failedDate = new Date(m.failedAt);
    const diffTime = Math.abs(now - failedDate);
    const diffHours = diffTime / (1000 * 60 * 60); 
    return diffHours >= 12;
  });
};
