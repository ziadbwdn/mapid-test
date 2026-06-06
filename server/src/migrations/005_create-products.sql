CREATE TABLE IF NOT EXISTS products (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    product_key         INT            NOT NULL UNIQUE,
    product_name        VARCHAR(255)   NOT NULL,
    geojson_feature_id  VARCHAR(36),

    category_id         UUID           NOT NULL
                                       REFERENCES categories(id)
                                       ON DELETE RESTRICT ON UPDATE CASCADE,
    sub_category_id     UUID           NOT NULL
                                       REFERENCES sub_categories(id)
                                       ON DELETE RESTRICT ON UPDATE CASCADE,
    segment_id          UUID           NOT NULL
                                       REFERENCES product_segments(id)
                                       ON DELETE RESTRICT ON UPDATE CASCADE,

    cost                NUMERIC(10,2)  NOT NULL CHECK (cost >= 0),
    avg_selling_price   NUMERIC(10,2)  NOT NULL CHECK (avg_selling_price >= 0),
    avg_order_revenue   NUMERIC(10,2)  NOT NULL CHECK (avg_order_revenue >= 0),
    avg_monthly_revenue NUMERIC(12,2)  NOT NULL CHECK (avg_monthly_revenue >= 0),

    total_orders        INT            NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
    total_revenue       NUMERIC(15,2)  NOT NULL DEFAULT 0 CHECK (total_revenue >= 0),
    total_quantity      INT            NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
    total_customers     INT            NOT NULL DEFAULT 0 CHECK (total_customers >= 0),

    last_sale_date      DATE,
    recency             INT            CHECK (recency >= 0),
    time_span           INT            CHECK (time_span > 0),

    location            GEOGRAPHY(POINT, 4326) NOT NULL,
    longitude           NUMERIC(10,6)  NOT NULL
                                       CHECK (longitude BETWEEN -180 AND 180),
    latitude            NUMERIC(10,6)  NOT NULL
                                       CHECK (latitude  BETWEEN -90  AND 90),

    health_score        SMALLINT       CHECK (health_score BETWEEN 0 AND 100),
    health_status       VARCHAR(10)    CHECK (health_status IN ('Healthy', 'At Risk', 'Critical')),

    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
