import supabase from '../supabase/supabaseClient';

export const authService = {
  /**
   * Generates or fetches profile for any active authenticated user
   */
  async bootstrapProfile(user) {
    if (!user) return null;
    let profile = await this.getProfile(user.id);
    
    if (!profile) {
      const metadata = user.user_metadata || {};
      const profileInfo = {
        id: user.id,
        email: user.email,
        role: metadata.role || 'student', // default
        class: metadata.class_name || 'class10',
        name: metadata.full_name || user.email.split('@')[0],
        date_of_birth: metadata.date_of_birth || null,
        city: metadata.city || null
      };

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert(profileInfo)
        .select()
        .single();
        
      if (!error) {
        profile = newProfile;
        profile._isNewUser = true; // Temporary flag for first login
      } else {
        // Race condition fallback: If context and login() race to insert, fetch the newly inserted row
        profile = await this.getProfile(user.id);
      }
    }
    return profile;
  },

  /**
   * Login using Supabase Auth
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    const profile = await this.bootstrapProfile(data.user);
    return { user: data.user, profile };
  },

  /**
   * Login using Google OAuth
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/student-dashboard', // Generic, dynamic route handle later
      }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Signup using Supabase Auth (Profile will be generated on first login)
   */
  async signup(email, password, name, className, dateOfBirth, city) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          class_name: className,
          date_of_birth: dateOfBirth,
          city: city
        }
      }
    });
    
    if (authError) throw authError;
    return { user: authData.user, profile: null, session: authData.session };
  },

  /**
   * Logout
   */
  async logout() {
    sessionStorage.removeItem("masterAdmin");
    sessionStorage.removeItem("mockStudent");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get Current Session/User
   */
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  },

  /**
   * Fetch custom Profile from 'profiles' table
   */
  async getProfile(userId) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      return null;
    }
    return data;
  }
};
