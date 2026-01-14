
import { supabase } from '../utils/supabaseClient';
import { User, AuthResponse, SavedSession, LifeEvent, Strategy, Order, ScheduledOrder } from '../types';

class SupabaseApiService {
  
  // Helper to map Supabase user format to our App's User interface
  private mapUser(u: any): User {
    return {
      id: u.id,
      name: u.user_metadata?.name || u.email?.split('@')[0] || 'Traveler',
      email: u.email || '',
      isPro: u.user_metadata?.is_pro || false,
      hasSeenOnboarding: u.user_metadata?.has_seen_onboarding || false,
      joinedAt: u.created_at,
      timezone: u.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      email_reminders: u.user_metadata?.email_reminders || false,
    };
  }

  // --- PUBLIC API METHODS ---

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user || !data.session) throw new Error('No session created');

    return {
      user: this.mapUser(data.user),
      token: data.session.access_token,
    };
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          is_pro: false, // Default status stored in metadata
          has_seen_onboarding: false,
          timezone: timezone,
          email_reminders: false,
        },
      },
    });

    if (error) throw new Error(error.message);
    
    // If email confirmation is enabled in Supabase, data.session might be null
    if (!data.user) throw new Error('Registration failed');
    
    return {
      user: this.mapUser(data.user),
      token: data.session?.access_token || '',
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async getProfile(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.mapUser(user);
  }

  async upgradeToPro(userId: string): Promise<User> {
    // We update the user metadata. 
    const { data, error } = await supabase.auth.updateUser({
      data: { is_pro: true }
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Failed to update user');

    return this.mapUser(data.user);
  }

  async completeOnboarding(): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      data: { has_seen_onboarding: true }
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Failed to update user');

    return this.mapUser(data.user);
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    // This triggers the password reset email flow in Supabase
    // The user will be emailed a link which redirects them back to the app with a token
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirect back to this app
    });

    if (error) throw new Error(error.message);
  }

  // --- ACCOUNT SETTINGS ---

  async updateProfile(updates: { name?: string, timezone?: string, email_reminders?: boolean }): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Failed to update profile');

    return this.mapUser(data.user);
  }

  async updateEmail(newEmail: string): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
        email: newEmail
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Failed to initiate email update');
    
    return this.mapUser(data.user);
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    // If oldPassword and newPassword are same (hack for recovery mode from AuthContext), skip verify
    if (oldPassword !== newPassword) {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user || !user.email) throw new Error("User not found");
         
         const { error: authError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: oldPassword
        });
        if (authError) throw new Error("Current password incorrect");
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw new Error(updateError.message);
  }

  async deleteAccount(): Promise<void> {
    // Verify user session exists before attempting delete
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized action.");

    // Standard RLS prevents user from deleting their own Auth record.
    // We must use a Postgres RPC function (security definer).
    // SQL: create or replace function delete_user() returns void as $$ begin delete from auth.users where id = auth.uid(); end; $$ language plpgsql security definer;
    
    const { error } = await supabase.rpc('delete_user');
    
    if (error) {
        console.error("RPC Delete Failed:", error);
        throw new Error("Failed to delete account. Ensure database functions are configured.");
    }
    
    await this.logout();
  }

  // --- EDGE FUNCTIONS ---

  async sendTestSignal(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase.functions.invoke('market-signal', {
        body: { test_user_id: user.id }
    });

    if (error) {
        console.error("[API] Edge Function Failed:", error);
        throw new Error(error.message || "Failed to trigger market signal.");
    }
    
    // Check for application-level error returned in JSON (e.g. from try/catch in function)
    if (data && data.error) {
        console.error("[API] Edge Function returned logic error:", data.error);
        throw new Error(data.error);
    }
  }

  // --- SESSION MANAGEMENT ---

  async getSessions(): Promise<SavedSession[]> {
    // SECURITY: Explicitly scope to current user to prevent data leaks if RLS fails
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('aura_sessions')
      .select('*')
      .eq('user_id', user.id) // Explicit ownership check
      .order('created_at', { ascending: false });

    if (error) {
      // Return empty array if table doesn't exist yet to prevent crash
      return [];
    }
    return data as SavedSession[];
  }

  async saveSession(session: Partial<SavedSession>): Promise<SavedSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to save.");

    const payload = {
      user_id: user.id,
      name: session.name,
      initial_score: session.initial_score,
      events: session.events,
    };

    let result;
    
    if (session.id) {
        // Update
        // SECURITY: Check both ID and User ownership to prevent IDOR
        result = await supabase
            .from('aura_sessions')
            .update(payload)
            .eq('id', session.id)
            .eq('user_id', user.id) // IDOR Protection
            .select()
            .single();
    } else {
        // Insert
        result = await supabase
            .from('aura_sessions')
            .insert(payload)
            .select()
            .single();
    }

    if (result.error) throw new Error(result.error.message);
    return result.data as SavedSession;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // We get the user first to log their ID for debugging
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    // We rely on RLS policies (auth.uid() = user_id) to handle security.
    const { data, error } = await supabase
        .from('aura_sessions')
        .delete()
        .eq('id', sessionId)
        .select();
    
    if (error) {
        console.error('[API] Error:', error);
        throw new Error(error.message);
    }
    
    // Check if anything was actually deleted.
    if (!data || data.length === 0) {
        throw new Error("Database permission denied (RLS) or session not found.");
    }
  }

  // --- STRATEGY MANAGEMENT (TEMPLATES) ---

  async getStrategies(): Promise<Strategy[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('aura_strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data as Strategy[];
  }

  async saveStrategy(name: string, orders: Order[]): Promise<Strategy> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Sanitize orders (remove filled status for templates)
    const templateOrders = orders.map(o => ({
        ...o,
        filled: false
    }));

    const { data, error } = await supabase
        .from('aura_strategies')
        .insert({
            user_id: user.id,
            name,
            orders: templateOrders
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Strategy;
  }

  async updateStrategy(id: string, name: string, orders: Order[]): Promise<Strategy> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const templateOrders = orders.map(o => ({ ...o, filled: false }));

    const { data, error } = await supabase
        .from('aura_strategies')
        .update({ name, orders: templateOrders })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Strategy;
  }

  async deleteStrategy(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from('aura_strategies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("Could not delete strategy.");
  }

  // --- SCHEDULED ORDERS (PLANNER & ORDER BOOK) ---

  async getScheduledOrders(date?: string): Promise<ScheduledOrder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
        .from('aura_scheduled_orders')
        .select('*')
        .eq('user_id', user.id);

    if (date) {
        query = query.eq('scheduled_date', date);
    }
    
    // Default sort by time
    const { data, error } = await query.order('time', { ascending: true });

    if (error) {
        console.error("Scheduled orders fetch error", error);
        return [];
    }
    return data as ScheduledOrder[];
  }

  async getScheduledOrdersByRange(start: string, end: string): Promise<ScheduledOrder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('aura_scheduled_orders')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', start)
        .lte('scheduled_date', end);

    if (error) return [];
    return data as ScheduledOrder[];
  }

  async saveScheduledOrder(order: Partial<ScheduledOrder>): Promise<ScheduledOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const payload = {
        ...order,
        user_id: user.id
    };

    let result;
    if (order.id) {
        result = await supabase
            .from('aura_scheduled_orders')
            .update(payload)
            .eq('id', order.id)
            .eq('user_id', user.id)
            .select()
            .single();
    } else {
        result = await supabase
            .from('aura_scheduled_orders')
            .insert(payload)
            .select()
            .single();
    }

    if (result.error) throw new Error(result.error.message);
    return result.data as ScheduledOrder;
  }

  async deleteScheduledOrder(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('aura_scheduled_orders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
    if (error) throw new Error(error.message);
  }

  async clearScheduledOrdersForDate(date: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('aura_scheduled_orders')
        .delete()
        .eq('user_id', user.id)
        .eq('scheduled_date', date);

    if (error) throw new Error(error.message);
  }

  async deployStrategyToDate(strategy: Strategy, date: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const bulkPayload = strategy.orders.map(o => ({
        user_id: user.id,
        scheduled_date: date,
        name: o.name,
        impact: o.impact,
        intensity: o.intensity,
        filled: false,
        time: o.time || null
    }));

    const { error } = await supabase
        .from('aura_scheduled_orders')
        .insert(bulkPayload);

    if (error) throw new Error(error.message);
  }
}

export const api = new SupabaseApiService();
