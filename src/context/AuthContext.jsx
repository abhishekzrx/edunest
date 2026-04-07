import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../supabase/supabaseClient';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [languagePreference, setLanguagePreference] = useState('english');

  useEffect(() => {
    // Extract shared logic for session loading
    const loadSession = async (session) => {
      try {
        // ✅ SESSION CHECK FOR MASTER ADMIN
        const isMasterAdmin = localStorage.getItem("masterAdmin");
        if (isMasterAdmin === "true") {
          setUser({ id: "master-admin", email: "admin@studynest.com" });
          setProfile({ role: "admin", name: "Master Admin", email: "admin@studynest.com", _isMaster: true });
          setLanguagePreference('english');
          setLoading(false);
          return;
        }

        // ✅ SESSION CHECK FOR MOCK STUDENT
        const mockStudentClass = localStorage.getItem("mockStudent");
        if (mockStudentClass) {
          setUser({ id: `mock-${mockStudentClass}`, email: `${mockStudentClass}@studynest.com` });
          setProfile({ role: "student", class: mockStudentClass, name: `Demo ${mockStudentClass.toUpperCase()}`, email: `${mockStudentClass}@studynest.com`, _isMock: true });
          setLanguagePreference('english');
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // OAuth magic links skip traditional "login()". Ensuring profile exists here covers them!
          const userProfile = await authService.bootstrapProfile(currentUser);
          setProfile(userProfile);
          setLanguagePreference(userProfile?.language_preference || 'english');
        } else {
          setProfile(null);
          setLanguagePreference('english');
        }
      } catch (error) {
        console.error("Auth session load error:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Supabase getSession error:", error);
      }
      loadSession(session);
    }).catch((err) => {
      console.error("Critical getSession error:", err);
      setLoading(false);
    });

    // Listen for auth changes anywhere in the app
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      await loadSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateLanguagePreference = async (lang) => {
    setLanguagePreference(lang);
    if (user && !profile._isMock && !profile._isMaster) {
      setProfile((prev) => ({ ...prev, language_preference: lang }));
      try {
        await supabase
          .from('profiles')
          .update({ language_preference: lang })
          .eq('id', user.id);
      } catch (err) {
        console.error("Failed to update language mapping:", err);
      }
    }
  };

  const value = { user, profile, loading, languagePreference, updateLanguagePreference };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
