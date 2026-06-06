CREATE OR REPLACE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_sub_categories_updated_at
    BEFORE UPDATE ON sub_categories
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_products_health_sync
    BEFORE INSERT OR UPDATE OF recency, time_span, total_orders, avg_monthly_revenue
    ON products
    FOR EACH ROW EXECUTE FUNCTION fn_sync_product_health();
