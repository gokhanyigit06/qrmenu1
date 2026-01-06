
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from lib/supabase.ts to ensure no import issues
const supabaseUrl = 'https://ppyvajojssguolwrqkzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXZham9qc3NndW9sd3Jxa3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODA0MDcsImV4cCI6MjA4MjI1NjQwN30.bgYKvBnDWbAHDdKqEBhY5mQ9C-ja8mMm7Wb3DobyB7s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Starting seed...");

    // 1. Get Restaurant
    const { data: restaurants, error: rError } = await supabase.from('restaurants').select('id').limit(1);
    if (rError || !restaurants || restaurants.length === 0) {
        console.error("Error getting restaurant", rError);
        return;
    }
    const restaurantId = restaurants[0].id;
    console.log("Found Restaurant ID:", restaurantId);

    // 2. Find or Create Category
    let categoryId;
    const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', 'Signature Cocktails')
        .limit(1);

    if (categories && categories.length > 0) {
        categoryId = categories[0].id;
        console.log("Category 'Signature Cocktails' already exists:", categoryId);
    } else {
        console.log("Creating 'Signature Cocktails' category...");
        const { data: newCat, error: cError } = await supabase
            .from('categories')
            .insert([{
                restaurant_id: restaurantId,
                name: 'Signature Cocktails',
                slug: 'signature-cocktails',
                sort_order: 10,
                is_active: true,
                layout_mode: 'list-no-image'
            }])
            .select()
            .single();

        if (cError) {
            console.error("Error creating category:", cError);
            return;
        }
        categoryId = newCat.id;
        console.log("Created category:", categoryId);
    }

    // 3. Insert Products
    const products = [
        { name: 'Finally Friday', desc: 'BEEFEATER GİN, TRİPLE SEC, SWEET SOUR, SALATALIK FESLEGEN' },
        { name: 'Red Rush', desc: 'ABSOLUT RASPBERRY, KIRMZI ORMAN MEYVELERİ, SWEET SOUR' },
        { name: 'Hot Crush', desc: 'OLMECA SILVER, PASSİON FRUİT, SWEET SOUR, CHİLİ SOS' },
        { name: 'Spice Bloom', desc: 'BEEFEATER GİN, LAVANTA SOS, KIRMIZI KAPYA BİBER' },
        { name: 'Bergamot Twist', desc: 'BEEFEATER GİN, AHUDUDU LİKÖRİ, SWEET SOUR, BERGAMOT SOS' },
        { name: 'Pinkfy', desc: 'BEAFEATER PİNK, SAFARI, HİNDİSTAN CEVİZİ SÜTÜ, LİMON SUYU' },
        { name: 'Highlife', desc: 'HAVANA ANEJO 3, OLMECA SİLVER, KEGLEVİC MELON, TRİPLE SEC, PASSİON FRUİT, SWEET SOUR' },
        { name: 'Sour Times', desc: 'ABSOLUT VOTKA or BEEFEATER GIN, KUZU KULAĞI, LİME' },
        { name: 'Melon Breeze', desc: 'APEROL, KEGLEVİC MELON, SWEET SOUR' }
    ];

    for (const p of products) {
        // Check if exists
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('category_id', categoryId)
            .ilike('name', p.name)
            .limit(1);

        if (existing && existing.length > 0) {
            console.log(`Product ${p.name} already exists. Skipping.`);
        } else {
            console.log(`Creating product ${p.name}...`);
            const { error: pError } = await supabase.from('products').insert([{
                restaurant_id: restaurantId,
                category_id: categoryId,
                name: p.name,
                description: p.desc,
                price: null, // Optional price logic we just added
                is_active: true,
                image: ''
            }]);
            if (pError) console.error(`Failed to create ${p.name}`, pError);
        }
    }

    console.log("Done!");
}

seed();
