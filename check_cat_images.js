const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ppyvajojssguolwrqkzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXZham9qc3NndW9sd3Jxa3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODA0MDcsImV4cCI6MjA4MjI1NjQwN30.bgYKvBnDWbAHDdKqEBhY5mQ9C-ja8mMm7Wb3DobyB7s';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data: categories, error } = await supabase.from('categories').select('id, name, image');
    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Categories with images:');
    categories.forEach(c => {
        if (c.image) {
            console.log(`[${c.name}] ${c.image}`);
        }
    });
}

checkCategories();
