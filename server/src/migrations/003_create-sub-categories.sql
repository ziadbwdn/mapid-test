CREATE TABLE IF NOT EXISTS sub_categories (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id    UUID          NOT NULL
                                 REFERENCES categories(id)
                                 ON DELETE RESTRICT
                                 ON UPDATE CASCADE,
    name           VARCHAR(100)  NOT NULL,
    description    TEXT,
    display_order  SMALLINT      NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_sub_category_per_category UNIQUE (category_id, name)
);

INSERT INTO sub_categories (category_id, name, description, display_order)
SELECT c.id, v.name, v.description, v.display_order
FROM (VALUES
    ('Accessories', 'Bottles and Cages', 'Botol minum dan holder',         1),
    ('Accessories', 'Tires and Tubes',   'Ban dan tube sepeda',            2),
    ('Accessories', 'Bike Stands',       'Standar parkir sepeda',          3),
    ('Accessories', 'Helmets',           'Helm keselamatan',               4),
    ('Accessories', 'Hydration Packs',   'Tas minum',                      5),
    ('Accessories', 'Bike Racks',        'Rak sepeda',                     6),
    ('Accessories', 'Fenders',           'Spakbor sepeda',                 7),
    ('Accessories', 'Cleaners',          'Pembersih sepeda',               8),
    ('Bikes',       'Road Bikes',        'Sepeda balap',                   1),
    ('Bikes',       'Mountain Bikes',    'Sepeda gunung',                  2),
    ('Bikes',       'Touring Bikes',     'Sepeda touring',                 3),
    ('Clothing',    'Vests',             'Rompi bersepeda',                1),
    ('Clothing',    'Socks',             'Kaos kaki',                      2),
    ('Clothing',    'Jerseys',           'Jersey bersepeda',               3),
    ('Clothing',    'Shorts',            'Celana pendek',                  4),
    ('Clothing',    'Gloves',            'Sarung tangan',                  5),
    ('Clothing',    'Caps',              'Topi',                           6)
) AS v(cat_name, name, description, display_order)
JOIN categories c ON c.name = v.cat_name
ON CONFLICT (category_id, name) DO NOTHING;
