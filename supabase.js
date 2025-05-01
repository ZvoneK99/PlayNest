import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://prgtpdcgcimkmacxqdds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZ3RwZGNnY2lta21hY3hxZGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTI5NjAsImV4cCI6MjA1OTk2ODk2MH0.YRx5VBnU_Ij910uWaUynDLG6CK7lyupW_uQ9LD-R3oQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
