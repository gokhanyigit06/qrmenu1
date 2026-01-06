DO $$
DECLARE
    v_restaurant_id UUID;
    v_category_id UUID;
BEGIN
    -- 1. Get the Restaurant ID (Taking the first one)
    SELECT id INTO v_restaurant_id FROM restaurants LIMIT 1;

    -- 2. Find or Create Category 'Signature Cocktails'
    SELECT id INTO v_category_id FROM categories WHERE name ILIKE 'Signature Cocktails' AND restaurant_id = v_restaurant_id LIMIT 1;

    IF v_category_id IS NULL THEN
        INSERT INTO categories (restaurant_id, name, slug, sort_order, is_active, layout_mode)
        VALUES (v_restaurant_id, 'Signature Cocktails', 'signature-cocktails', 10, true, 'list-no-image')
        RETURNING id INTO v_category_id;
    END IF;

    -- 3. Insert Products
    -- Finally Friday
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Finally Friday', 'BEEFEATER GİN, TRİPLE SEC, SWEET SOUR, SALATALIK FESLEGEN', NULL, true, '');

    -- Red Rush
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Red Rush', 'ABSOLUT RASPBERRY, KIRMZI ORMAN MEYVELERİ, SWEET SOUR', NULL, true, '');

    -- Hot Crush
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Hot Crush', 'OLMECA SILVER, PASSİON FRUİT, SWEET SOUR, CHİLİ SOS', NULL, true, '');

    -- Spice Bloom
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Spice Bloom', 'BEEFEATER GİN, LAVANTA SOS, KIRMIZI KAPYA BİBER', NULL, true, '');

    -- Bergamot Twist
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Bergamot Twist', 'BEEFEATER GİN, AHUDUDU LİKÖRİ, SWEET SOUR, BERGAMOT SOS', NULL, true, '');

    -- Pinkfy
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Pinkfy', 'BEAFEATER PİNK, SAFARI, HİNDİSTAN CEVİZİ SÜTÜ, LİMON SUYU', NULL, true, '');

    -- Highlife
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Highlife', 'HAVANA ANEJO 3, OLMECA SİLVER, KEGLEVİC MELON, TRİPLE SEC, PASSİON FRUİT, SWEET SOUR', NULL, true, '');

    -- Sour Times
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Sour Times', 'ABSOLUT VOTKA or BEEFEATER GIN, KUZU KULAĞI, LİME', NULL, true, '');

    -- Melon Breeze
    INSERT INTO products (restaurant_id, category_id, name, description, price, is_active, image)
    VALUES (v_restaurant_id, v_category_id, 'Melon Breeze', 'APEROL, KEGLEVİC MELON, SWEET SOUR', NULL, true, '');

END $$;
