CREATE INDEX IF NOT EXISTS idx_products_location
    ON products USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_products_name_fts
    ON products USING GIN (to_tsvector('english', product_name));

CREATE INDEX IF NOT EXISTS idx_products_category_id
    ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_sub_category_id
    ON products (sub_category_id);
CREATE INDEX IF NOT EXISTS idx_products_segment_id
    ON products (segment_id);

CREATE INDEX IF NOT EXISTS idx_products_category_segment
    ON products (category_id, segment_id)
    INCLUDE (product_name, cost, total_revenue, recency, health_status);

CREATE INDEX IF NOT EXISTS idx_products_total_revenue
    ON products (total_revenue DESC);
CREATE INDEX IF NOT EXISTS idx_products_cost
    ON products (cost);
CREATE INDEX IF NOT EXISTS idx_products_recency
    ON products (recency);
CREATE INDEX IF NOT EXISTS idx_products_health_status
    ON products (health_status);
CREATE INDEX IF NOT EXISTS idx_products_last_sale_date
    ON products (last_sale_date DESC);

CREATE INDEX IF NOT EXISTS idx_snapshots_product_id
    ON product_health_snapshots (product_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date
    ON product_health_snapshots (snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_health_status
    ON product_health_snapshots (health_status);
