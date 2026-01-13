import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'aura_supabase_url';
const SUPABASE_KEY_KEY = 'aura_supabase_key';

const defaultUrl = 'https://ccjlidlpcxommrcqlepv.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjamxpZGxwY3hvbW1yY3FsZXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMTI4MTgsImV4cCI6MjA4MTc4ODgxOH0.-L3YQy1O-BiB6J7HTw5mLRedoCgGjg8a2x1G_AwpsgE';

const getSupabaseConfig = () => {
  try {
    const storedUrl = localStorage.getItem(SUPABASE_URL_KEY);
    const storedKey = localStorage.getItem(SUPABASE_KEY_KEY);
    return {
      url: storedUrl || defaultUrl,
      key: storedKey || defaultKey
    };
  } catch (error) {
    return {
      url: defaultUrl,
      key: defaultKey
    };
  }
};

const config = getSupabaseConfig();

export const supabase = createClient(config.url, config.key);

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_KEY_KEY, key);
  window.location.reload();
};