CREATE TABLE IF NOT EXISTS product_segments (
    id                       UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    name                     VARCHAR(20)    NOT NULL UNIQUE,
    description              TEXT,
    color_code               VARCHAR(7)     NOT NULL DEFAULT '#6b7280'
                                            CHECK (color_code ~ '^#[0-9a-fA-F]{6}$'),
    min_recency_threshold    INT            CHECK (min_recency_threshold >= 0),
    min_time_span_threshold  INT            CHECK (min_time_span_threshold >= 0),
    min_avg_monthly_revenue  NUMERIC(12,2)  CHECK (min_avg_monthly_revenue >= 0),
    created_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

INSERT INTO product_segments (name, description, color_code) VALUES
    ('High-Performer', 'Produk dengan performa penjualan tinggi',   '#10b981'),
    ('Mid-Range',      'Produk dengan performa penjualan menengah', '#3b82f6'),
    ('Low-Performer',  'Produk dengan performa penjualan rendah',   '#ef4444')
ON CONFLICT (name) DO NOTHING;
