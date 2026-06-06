CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_product_health(
    p_recency             INT,
    p_time_span           INT,
    p_total_orders        INT,
    p_avg_monthly_revenue NUMERIC
)
RETURNS TABLE (
    health_score  SMALLINT,
    health_status VARCHAR(10)
) LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    v_recency_score   NUMERIC;
    v_longevity_score NUMERIC;
    v_activity_score  NUMERIC;
    v_revenue_score   NUMERIC;
    v_final           SMALLINT;
BEGIN
    v_recency_score   := GREATEST(0, 100 - (COALESCE(p_recency, 999)::NUMERIC / 333) * 100);
    v_longevity_score := LEAST(100, (COALESCE(p_time_span, 0)::NUMERIC / 24) * 100);
    v_activity_score  := LEAST(100, (COALESCE(p_total_orders, 0)::NUMERIC / 5000) * 100);
    v_revenue_score   := LEAST(100, (COALESCE(p_avg_monthly_revenue, 0) / 10000) * 100);

    v_final := ROUND(
        v_recency_score   * 0.30 +
        v_longevity_score * 0.20 +
        v_activity_score  * 0.25 +
        v_revenue_score   * 0.25
    )::SMALLINT;

    health_score  := v_final;
    health_status := CASE
        WHEN v_final >= 70 THEN 'Healthy'
        WHEN v_final >= 40 THEN 'At Risk'
        ELSE                    'Critical'
    END;

    RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION fn_sync_product_health()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_result RECORD;
BEGIN
    SELECT * INTO v_result
    FROM calculate_product_health(
        NEW.recency,
        NEW.time_span,
        NEW.total_orders,
        NEW.avg_monthly_revenue
    );
    NEW.health_score  := v_result.health_score;
    NEW.health_status := v_result.health_status;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION get_products_within_radius(
    p_longitude     NUMERIC,
    p_latitude      NUMERIC,
    p_radius_meters INT DEFAULT 50000
)
RETURNS TABLE (
    product_id      UUID,
    product_name    VARCHAR,
    category_name   VARCHAR,
    segment_name    VARCHAR,
    health_status   VARCHAR,
    distance_meters NUMERIC,
    longitude       NUMERIC,
    latitude        NUMERIC
) LANGUAGE plpgsql STABLE AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.product_name,
        c.name,
        ps.name,
        p.health_status,
        ST_Distance(
            p.location,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
        )::NUMERIC AS distance_meters,
        p.longitude,
        p.latitude
    FROM products p
    JOIN categories       c  ON c.id  = p.category_id
    JOIN product_segments ps ON ps.id = p.segment_id
    WHERE ST_DWithin(
        p.location,
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
        p_radius_meters
    )
    ORDER BY distance_meters;
END;
$$;

CREATE OR REPLACE FUNCTION fn_refresh_analytics()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_summary;
END;
$$;
