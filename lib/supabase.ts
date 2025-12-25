
import { createClient } from '@supabase/supabase-js';

// NOT: Güvenlik için bunları normalde .env.local dosyasına koymalıyız.
// Ancak erişim kısıtlaması nedeniyle şimdilik buraya ekliyorum.
const supabaseUrl = 'https://ppyvajojssguolwrqkzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXZham9qc3NndW9sd3Jxa3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODA0MDcsImV4cCI6MjA4MjI1NjQwN30.bgYKvBnDWbAHDdKqEBhY5mQ9C-ja8mMm7Wb3DobyB7s';

export const supabase = createClient(supabaseUrl, supabaseKey);
