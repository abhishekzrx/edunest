import supabase from '../supabase/supabaseClient';

export const GLOBAL_CACHE = {
  chapters: new Map(),
  flashcards: new Map(),
  mcqs: new Map()
};

export const clearSystemCache = () => {
   GLOBAL_CACHE.chapters.clear();
   GLOBAL_CACHE.flashcards.clear();
   GLOBAL_CACHE.mcqs.clear();
};

export const saveTestProgress = async (userId, className, subject, chapter, score, accuracy) => {
  try {
    const { data, error } = await supabase.from('progress').insert([
      { user_id: userId, class_name: className, subject, chapter, score, accuracy }
    ]);
    if (error) throw error;

    // Check for weak area
    if (accuracy < 50) {
      await updateWeakArea(userId, className, subject, chapter, score);
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Error saving progress:', err);
    return { success: false, error: err };
  }
};

export const updateWeakArea = async (userId, className, subject, chapter, lastScore) => {
  // Try to find existing
  const { data: existing, error: fetchErr } = await supabase
    .from('weak_areas')
    .select('id')
    .eq('user_id', userId)
    .eq('class_name', className)
    .eq('subject', subject)
    .eq('chapter', chapter)
    .limit(1);
    
  // If found array has elements, update it
  if (existing && existing.length > 0) {
    await supabase
      .from('weak_areas')
      .update({ last_score: lastScore, updated_at: new Date().toISOString() })
      .eq('id', existing[0].id);
  } else {
    // If not found, insert new
    await supabase.from('weak_areas').insert([
      { user_id: userId, class_name: className, subject, chapter, last_score: lastScore }
    ]);
  }
};

export const fetchDashboardStats = async (userId) => {
  try {
    // Fetch Tests from progress table for user
    const { data: progressData, error: progErr } = await supabase
      .from('progress')
      .select('accuracy, subject')
      .eq('user_id', userId);

    if (progErr) throw progErr;

    const testsTaken = progressData ? progressData.length : 0;
    
    let overallScore = 0;
    const subjectStats = {
       science: { attempted: 0, sum: 0 },
       maths: { attempted: 0, sum: 0 }
    };

    if (testsTaken > 0) {
      const sum = progressData.reduce((acc, curr) => acc + curr.accuracy, 0);
      overallScore = Math.round(sum / testsTaken);

      progressData.forEach(p => {
         const subj = p.subject?.toLowerCase();
         if (subjectStats[subj]) {
            subjectStats[subj].attempted++;
            subjectStats[subj].sum += p.accuracy;
         }
      });
    }

    // Fetch weak areas
    const { data: weakAreasData, error: weakErr } = await supabase
      .from('weak_areas')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (weakErr) throw weakErr;

    return { 
      overallScore, 
      testsTaken, 
      subjectStats,
      weakAreas: weakAreasData || [] 
    };

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { overallScore: 0, testsTaken: 0, subjectStats: { science: { attempted: 0, sum: 0 }, maths: { attempted: 0, sum: 0 } }, weakAreas: [] };
  }
};

export const testSupabaseConnection = async () => {
  try {
    // 1. Basic network / auth ping to verify URL + Key
    const { error: authError } = await supabase.auth.getSession();
    if (authError && authError.message.includes('FetchError')) {
      return { success: false, error: 'Network error. Check your Supabase URL.' };
    }

    // 2. Check Postgres connection & table existence
    const { error } = await supabase.from('progress').select('id').limit(1);
    
    if (error) {
      if (error.code === '42P01' || (error.message && error.message.includes('relation "public.progress" does not exist'))) {
         return { 
           success: false, 
           error: 'Connected to Supabase successfully! But the tables (progress, weak_areas) are missing. Please run the SQL query to create them.' 
         };
      }
      // If it's an RLS error, it might not return an error but empty data. If it does return an error about RLS, it's connected!
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveCustomMCQs = async (className, subject, chapter, mcqData) => {
  try {
    // Delete existing to act as an overwrite/upsert for this chapter
    await supabase
      .from('custom_mcqs')
      .delete()
      .eq('class_name', className)
      .eq('subject', subject)
      .eq('chapter', chapter);

    const { data, error } = await supabase.from('custom_mcqs').insert([
      { class_name: className, subject: subject, chapter: chapter, mcq_data: mcqData }
    ]);
    
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchCustomMCQs = async (className, subject, chapter) => {
  try {
    const { data, error } = await supabase
      .from('custom_mcqs')
      .select('mcq_data')
      .eq('class_name', className)
      .eq('subject', subject)
      .eq('chapter', chapter)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn("fetchCustomMCQs warning:", error);
    }
    
    if (data && data.mcq_data) {
      if (typeof data.mcq_data === 'string') {
        try {
          return JSON.parse(data.mcq_data);
        } catch(e) {
          return [];
        }
      }
      return data.mcq_data;
    }
    
    return [];
  } catch (err) {
    return [];
  }
};

export const clearCustomMCQs = async (className, subject, chapter) => {
  try {
    const { error } = await supabase
      .from('custom_mcqs')
      .delete()
      .eq('class_name', className)
      .eq('subject', subject)
      .eq('chapter', chapter);
      
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchClassAnalytics = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('class')
      .eq('role', 'student');

    if (error) throw error;

    const stats = { class9: 0, class10: 0, class11: 0, class12: 0 };
    data.forEach(p => {
      if (stats[p.class] !== undefined) {
        stats[p.class]++;
      }
    });
    return { success: true, data: stats, total: data.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- DYNAMIC CHAPTER & MCQ ENGINE ---

export const fetchAllChapters = async (classNameFilter, subjectFilter) => {
  const cacheKey = `${classNameFilter}-${subjectFilter}`;
  if (GLOBAL_CACHE.chapters.has(cacheKey)) {
    return { success: true, data: GLOBAL_CACHE.chapters.get(cacheKey) };
  }

  try {
    let query = supabase.from('chapters').select('*, content_access(*)').order('chapter_no', { ascending: true, nullsFirst: false });
    
    if (classNameFilter) query = query.eq('class_name', classNameFilter);
    if (subjectFilter) query = query.eq('subject', subjectFilter);
    
    const { data, error } = await query;
    if (error && error.code !== '42P01') throw error;
    
    const normalizedData = (data || []).map(ch => ({
        ...ch,
        content_access: (ch.content_access && ch.content_access.length > 0) 
            ? ch.content_access[0] 
            : { show_notes: true, show_mcqs: true, show_flashcards: true }
    }));

    GLOBAL_CACHE.chapters.set(cacheKey, normalizedData);
    return { success: true, data: normalizedData };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
};

export const addChapter = async (name, subject, className, chapterNo) => {
  try {
    const { data, error } = await supabase.from('chapters').insert([
      { name, subject, class_name: className, chapter_no: chapterNo }
    ]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deleteChapter = async (chapterId) => {
  try {
    const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveDynamicMCQs = async (chapterId, parsedMCQs) => {
  try {
    // mapped extended schema: question_hi, options_hi, explanation_en, explanation_hi
    const formattedPayload = parsedMCQs.map(mcq => ({
      chapter_id: chapterId,
      question: mcq.question || mcq.question_en, // Act as English/Base
      question_hi: mcq.question_hi || null,
      options: mcq.options || mcq.options_en || [], 
      options_hi: mcq.options_hi || null,
      explanation_en: mcq.explanation_en || mcq.explanation || null,
      explanation_hi: mcq.explanation_hi || null,
      correct_answer: mcq.answer
    }));

    const { data, error } = await supabase.from('mcqs').insert(formattedPayload);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchDynamicMCQs = async (chapterId) => {
  if (GLOBAL_CACHE.mcqs.has(chapterId)) {
    return { success: true, data: GLOBAL_CACHE.mcqs.get(chapterId) };
  }

  try {
    const { data, error } = await supabase.from('mcqs').select('*').eq('chapter_id', chapterId);
    if (error) throw error;
    
    GLOBAL_CACHE.mcqs.set(chapterId, data || []);
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
};

export const purgeChapterAndMCQs = async (chapterId) => {
  try {
    // 1. Delete all MCQs natively matching this chapter_id
    const { error: mcqError } = await supabase.from('mcqs').delete().eq('chapter_id', chapterId);
    if (mcqError) throw mcqError;

    // 2. Delete the chapter
    const { error: chapterError } = await supabase.from('chapters').delete().eq('id', chapterId);
    if (chapterError) throw chapterError;

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchMCQDistribution = async (className) => {
  try {
    // Fetch chapters for the class
    const { data: chapters, error: chError } = await supabase
      .from('chapters')
      .select('id, name, chapter_no, subject')
      .eq('class_name', className)
      .order('chapter_no', { ascending: true, nullsFirst: false });
      
    if (chError) throw chError;
    if (!chapters || chapters.length === 0) return { success: true, data: [] };

    // Fetch all MCQs for these chapters
    const chapterIds = chapters.map(ch => ch.id);
    const { data: mcqs, error: mError } = await supabase
      .from('mcqs')
      .select('id, chapter_id')
      .in('chapter_id', chapterIds);

    if (mError && mError.code !== '42P01') throw mError;
    // 42P01 means table doesn't exist yet, we treat as 0 MCQs

    // Map counts
    const distribution = chapters.map(ch => {
      const count = mcqs ? mcqs.filter(m => m.chapter_id === ch.id).length : 0;
      return {
        id: ch.id,
        chapter: `Ch ${ch.chapter_no}: ${ch.name}`,
        subject: ch.subject,
        count: count
      };
    });

    return { success: true, data: distribution };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- CONTENT ACCESS ENGINE ---

export const fetchContentAccessForChapter = async (chapterId) => {
  try {
    const { data, error } = await supabase
      .from('content_access')
      .select('*')
      .eq('chapter_id', chapterId)
      .single();
    
    // If no row exists, default to fully true
    if (error && error.code === 'PGRST116') {
      return { success: true, data: { show_notes: true, show_mcqs: true, show_flashcards: true } };
    }
    if (error && error.code !== '42P01') throw error;
    
    return { success: true, data: data || { show_notes: true, show_mcqs: true, show_flashcards: true } };
  } catch (err) {
    return { success: false, error: err.message, data: { show_notes: true, show_mcqs: true, show_flashcards: true } };
  }
};

export const saveContentAccess = async (chapterId, accessConfig) => {
  try {
    // Upsert equivalent since we have a unique constraint on chapter_id
    const { data: existing } = await supabase
      .from('content_access')
      .select('id')
      .eq('chapter_id', chapterId)
      .single();

    let res;
    if (existing) {
      res = await supabase
        .from('content_access')
        .update({
          show_notes: accessConfig.show_notes,
          show_mcqs: accessConfig.show_mcqs,
          show_flashcards: accessConfig.show_flashcards,
          updated_at: new Date().toISOString()
        })
        .eq('chapter_id', chapterId);
    } else {
      res = await supabase
        .from('content_access')
        .insert([{
          chapter_id: chapterId,
          show_notes: accessConfig.show_notes,
          show_mcqs: accessConfig.show_mcqs,
          show_flashcards: accessConfig.show_flashcards
        }]);
    }
    
    if (res.error) throw res.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- FLASHCARDS ENGINE ---

export const fetchDynamicFlashcards = async (chapterId) => {
  if (GLOBAL_CACHE.flashcards.has(chapterId)) {
    return { success: true, data: GLOBAL_CACHE.flashcards.get(chapterId) };
  }

  try {
    const { data, error } = await supabase.from('flashcards').select('*').eq('chapter_id', chapterId);
    if (error && error.code !== '42P01') throw error;
    
    GLOBAL_CACHE.flashcards.set(chapterId, data || []);
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
};

export const saveDynamicFlashcards = async (chapterId, flashcards) => {
  try {
    // Delete existing to act as overwrite
    await supabase.from('flashcards').delete().eq('chapter_id', chapterId);

    const formattedPayload = flashcards.map(card => ({
      chapter_id: chapterId,
      front_en: card.front_en,
      front_hi: card.front_hi || null,
      back_en: card.back_en,
      back_hi: card.back_hi || null
    }));

    const { data, error } = await supabase.from('flashcards').insert(formattedPayload);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
