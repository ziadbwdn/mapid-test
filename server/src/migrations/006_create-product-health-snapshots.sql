CREATE TABLE IF NOT EXISTS product_health_snapshots (
    id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id           UUID           NOT NULL
                                        REFERENCES products(id)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    snapshot_date        DATE           NOT NULL DEFAULT CURRENT_DATE,

    total_orders         INT            DEFAULT 0,
    total_revenue        NUMERIC(15,2)  DEFAULT 0,
    total_quantity       INT            DEFAULT 0,
    total_customers      INT            DEFAULT 0,
    recency              INT,
    avg_monthly_revenue  NUMERIC(12,2),

    health_score         SMALLINT       CHECK (health_score BETWEEN 0 AND 100),
    health_status        VARCHAR(10)    CHECK (health_status IN ('Healthy', 'At Risk', 'Critical')),

    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_product_snapshot UNIQUE (product_id, snapshot_date)
);
