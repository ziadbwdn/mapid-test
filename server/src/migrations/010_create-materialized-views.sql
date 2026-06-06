CREATE MATERIALIZED VIEW IF NOT EXISTS mv_analytics_summary AS
SELECT
    'category'          AS dimension_type,
    c.name              AS dimension_value,
    c.color_code        AS color_code,
    COUNT(*)            AS product_count,
    SUM(p.total_revenue)        AS total_revenue,
    SUM(p.total_quantity)       AS total_quantity_sold,
    SUM(p.total_orders)         AS total_orders,
    AVG(p.cost)                 AS avg_cost,
    MIN(p.cost)                 AS min_cost,
    MAX(p.cost)                 AS max_cost,
    AVG(p.recency)              AS avg_recency,
    AVG(p.time_span)            AS avg_time_span,
    AVG(p.avg_monthly_revenue)  AS avg_monthly_revenue,
    COUNT(*) FILTER (WHERE p.health_status = 'Healthy')   AS healthy_count,
    COUNT(*) FILTER (WHERE p.health_status = 'At Risk')   AS at_risk_count,
    COUNT(*) FILTER (WHERE p.health_status = 'Critical')  AS critical_count,
    NOW() AS computed_at
FROM products p
JOIN categories c ON c.id = p.category_id
GROUP BY c.name, c.color_code

UNION ALL

SELECT
    'segment'           AS dimension_type,
    ps.name             AS dimension_value,
    ps.color_code       AS color_code,
    COUNT(*)            AS product_count,
    SUM(p.total_revenue)        AS total_revenue,
    SUM(p.total_quantity)       AS total_quantity_sold,
    SUM(p.total_orders)         AS total_orders,
    AVG(p.cost)                 AS avg_cost,
    MIN(p.cost)                 AS min_cost,
    MAX(p.cost)                 AS max_cost,
    AVG(p.recency)              AS avg_recency,
    AVG(p.time_span)            AS avg_time_span,
    AVG(p.avg_monthly_revenue)  AS avg_monthly_revenue,
    COUNT(*) FILTER (WHERE p.health_status = 'Healthy')   AS healthy_count,
    COUNT(*) FILTER (WHERE p.health_status = 'At Risk')   AS at_risk_count,
    COUNT(*) FILTER (WHERE p.health_status = 'Critical')  AS critical_count,
    NOW() AS computed_at
FROM products p
JOIN product_segments ps ON ps.id = p.segment_id
GROUP BY ps.name, ps.color_code

UNION ALL

SELECT
    'sub_category'      AS dimension_type,
    sc.name             AS dimension_value,
    cat.color_code      AS color_code,
    COUNT(*)            AS product_count,
    SUM(p.total_revenue)        AS total_revenue,
    SUM(p.total_quantity)       AS total_quantity_sold,
    SUM(p.total_orders)         AS total_orders,
    AVG(p.cost)                 AS avg_cost,
    MIN(p.cost)                 AS min_cost,
    MAX(p.cost)                 AS max_cost,
    AVG(p.recency)              AS avg_recency,
    AVG(p.time_span)            AS avg_time_span,
    AVG(p.avg_monthly_revenue)  AS avg_monthly_revenue,
    COUNT(*) FILTER (WHERE p.health_status = 'Healthy')   AS healthy_count,
    COUNT(*) FILTER (WHERE p.health_status = 'At Risk')   AS at_risk_count,
    COUNT(*) FILTER (WHERE p.health_status = 'Critical')  AS critical_count,
    NOW() AS computed_at
FROM products p
JOIN sub_categories sc ON sc.id = p.sub_category_id
JOIN categories    cat ON cat.id = sc.category_id
GROUP BY sc.name, cat.color_code;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_analytics_summary_pk
    ON mv_analytics_summary (dimension_type, dimension_value);
