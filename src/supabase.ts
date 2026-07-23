import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhtuflcjaykwwftiylxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodHVmbGNqYXlrd3dmdGl5bHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NjE5MzAsImV4cCI6MjEwMDMzNzkzMH0.BH3xAsOFCZ4CbNLUI1jVEcj69mVV1KkV2tWJmaUJK7U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
