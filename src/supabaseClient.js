import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gkejcmaoohdmzsfsqecy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZWpjbWFvb2hkbXpzZnNxZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODYyMzYsImV4cCI6MjA3Njg2MjIzNn0.yZg4q_4V70rIroAfOT-sArQWp2W_zc5esHKCkgOcJGs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
