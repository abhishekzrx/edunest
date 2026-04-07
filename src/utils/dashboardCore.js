import supabase from '../supabase/supabaseClient';

export const fetchFullDashboardData = async (userId, className) => {
  if (!userId) return null;

  try {
    const [
      { data: progressData, error: progErr },
      { data: activitiesData, error: actErr },
      { data: leaderboardData, error: leadErr },
      { data: profileData, error: profErr }
    ] = await Promise.all([
      // 1. Fetch user performance/progress
      supabase.from('progress').select('*').eq('user_id', userId),
      // 2. Fetch recent activities
      supabase.from('activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      // 3. Fetch leaderboard (top users by class, ordered by points)
      supabase.from('profiles').select('id, name, points, class').eq('role', 'student').order('points', { ascending: false, nullsLast: true }).limit(10),
      // 4. Fetch the user's specific profile to get their points/streak centrally
      supabase.from('profiles').select('points, streak').eq('id', userId).single()
    ]);

    if (progErr) console.error("Error fetching progress:", progErr);
    if (actErr && actErr.code !== '42P01') console.error("Error fetching activities:", actErr);
    if (leadErr) console.error("Error fetching leaderboard:", leadErr);

    // Calculate Stats from progress
    let overallScore = 0;
    let testsTaken = 0;
    let chaptersCompletedSet = new Set();
    const subjectProgress = {}; // { 'physics': { attempts: 0, sumConfig: 0, chapters: Set }, ... }

    if (progressData && progressData.length > 0) {
      testsTaken = progressData.length;
      let totalSum = 0;

      progressData.forEach(p => {
        const subj = p.subject?.toLowerCase() || 'unknown';
        
        totalSum += p.accuracy || 0;
        chaptersCompletedSet.add(p.chapter);

        if (!subjectProgress[subj]) {
          subjectProgress[subj] = { attempts: 0, sumAccuracy: 0, chapters: new Set() };
        }
        subjectProgress[subj].attempts++;
        subjectProgress[subj].sumAccuracy += (p.accuracy || 0);
        subjectProgress[subj].chapters.add(p.chapter);
      });

      overallScore = Math.round(totalSum / testsTaken);
    }

    // Process Leaderboard
    const formattedLeaderboard = (leaderboardData || []).map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || 'Anonymous',
      points: user.points || 0,
      initial: (user.name || 'A').charAt(0).toUpperCase(),
      // Adding rank colors automatically
      color: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#06b6d4',
      isCurrent: user.id === userId
    }));

    return {
      success: true,
      stats: {
        accuracy: overallScore,
        mcqsAttempted: testsTaken * 10, // Approximation or you can add a raw count from MCQ table
        chaptersCompleted: chaptersCompletedSet.size,
        streak: profileData?.streak || 0,
        points: profileData?.points || 0
      },
      subjectProgress,
      recentActivities: activitiesData || [],
      leaderboard: formattedLeaderboard
    };

  } catch (error) {
    console.error("Dashboard core error:", error);
    return { success: false, error: error.message };
  }
};

export const logActivity = async (userId, type, title, metadata = {}) => {
  if (!userId) return;
  try {
    const { error } = await supabase.from('activities').insert([{
      user_id: userId,
      type,
      title,
      metadata
    }]);
    if (error) throw error;
  } catch (e) {
    console.error("Failed to log activity:", e.message);
  }
};
