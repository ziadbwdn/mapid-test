CREATE OR REPLACE VIEW vw_products_map AS
SELECT
    p.id,
    p.product_key,
    p.product_name,
    c.name              AS category,
    c.color_code        AS category_color,
    sc.name             AS sub_category,
    ps.name             AS segment,
    ps.color_code       AS segment_color,
    p.cost,
    p.avg_selling_price,
    p.avg_order_revenue,
    p.avg_monthly_revenue,
    p.total_orders,
    p.total_revenue,
    p.total_quantity,
    p.total_customers,
    p.last_sale_date,
    p.recency,
    p.time_span,
    p.health_score,
    p.health_status,
    p.latitude,
    p.longitude,
    ST_AsGeoJSON(p.location)::jsonb AS geojson_geometry
FROM products p
JOIN categories       c  ON c.id  = p.category_id
JOIN sub_categories   sc ON sc.id = p.sub_category_id
JOIN product_segments ps ON ps.id = p.segment_id;

CREATE OR REPLACE VIEW vw_kpi_summary AS
SELECT
    COUNT(*)                        AS total_products,
    SUM(total_revenue)              AS total_revenue,
    SUM(total_orders)               AS total_orders,
    SUM(total_quantity)             AS total_quantity_sold,
    SUM(total_customers)            AS total_customers,
    ROUND(AVG(cost)::NUMERIC, 2)    AS avg_product_cost,
    ROUND(AVG(avg_monthly_revenue)::NUMERIC, 2) AS avg_monthly_revenue,
    COUNT(*) FILTER (WHERE health_status = 'Healthy')  AS healthy_products,
    COUNT(*) FILTER (WHERE health_status = 'At Risk')  AS at_risk_products,
    COUNT(*) FILTER (WHERE health_status = 'Critical') AS critical_products,
    MIN(last_sale_date) AS earliest_sale_date,
    MAX(last_sale_date) AS latest_sale_date
FROM products;
