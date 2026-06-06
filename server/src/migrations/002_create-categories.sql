CREATE TABLE IF NOT EXISTS categories (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(50)   NOT NULL UNIQUE,
    description    TEXT,
    color_code     VARCHAR(7)    NOT NULL DEFAULT '#6b7280'
                                 CHECK (color_code ~ '^#[0-9a-fA-F]{6}$'),
    display_order  SMALLINT      NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name, description, color_code, display_order) VALUES
    ('Accessories', 'Aksesoris sepeda dan perlengkapan', '#3b82f6', 1),
    ('Bikes',       'Sepeda (Road, Mountain, Touring)',  '#10b981', 2),
    ('Clothing',    'Pakaian dan apparel bersepeda',     '#f59e0b', 3)
ON CONFLICT (name) DO NOTHING;
