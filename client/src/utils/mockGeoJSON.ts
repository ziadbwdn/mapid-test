import type { GeoJSONCollection } from '@/types'

const CATEGORIES = ['Accessories', 'Bikes', 'Clothing'] as const
const CATEGORY_COLORS: Record<string, string> = {
  Accessories: '#6366f1',
  Bikes: '#10b981',
  Clothing: '#f59e0b',
}
const SEGMENTS = ['High-Performer', 'Mid-Range', 'Low-Performer']
const HEALTH_STATUSES = ['Healthy', 'At Risk', 'Critical'] as const

const PRODUCT_NAMES = [
  'Sport-100 Helmet', 'Cross-Trail Bike', 'Aero Gloves', 'Trail Runner Shoes',
  'Mountain Frame Kit', 'Road Pedals', 'Pro Jersey', 'Touring Tires',
  'Enduro Suspension', 'Carbon Handlebar', 'Gear Shift Set', 'Hydration Pack',
  'Windbreaker Vest', 'All-Weather Jacket', 'Trail GPS Unit', 'Bike Light Set',
  'Padded Shorts', 'Insulated Gloves', 'Fast-roll Tubes', 'Chain Lube Kit',
  'Helmet Visor', 'Racing Saddle', 'Disc Brake Set', 'Pump Kit',
  'Water Bottle Cage', 'Reflective Vest', 'Elbow Guards', 'Knee Pads',
  'Tool Multi-kit', 'Shoe Covers', 'Cycling Cap', 'Arm Warmers',
  'Base Layer Top', 'Windproof Gilet', 'Tri Suit', 'Recovery Drink Mix',
  'Energy Gel Pack', 'Bike Computer', 'Speed Sensor', 'Cadence Sensor',
]
const SUB_CATEGORIES: Record<string, string[]> = {
  Accessories: ['Helmets', 'Gloves', 'Lights', 'Bottles & Cages', 'Tools', 'Sensors', 'Pumps'],
  Bikes: ['Frames', 'Wheels', 'Drivetrain', 'Brakes', 'Suspension', 'Handlebars', 'Pedals'],
  Clothing: ['Jerseys', 'Shorts', 'Jackets', 'Vests', 'Shoes', 'Gloves', 'Base Layers'],
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

export function generateMockGeoJSON(): GeoJSONCollection {
  const features = []
  const seed = Date.now()

  for (let i = 0; i < 100; i++) {
    const r = seededRandom(seed + i)
    const r2 = seededRandom(seed + i + 1000)
    const r3 = seededRandom(seed + i + 2000)
    const r4 = seededRandom(seed + i + 3000)

    const catIdx = Math.floor(r * CATEGORIES.length)
    const category = CATEGORIES[catIdx]
    const subCats = SUB_CATEGORIES[category]
    const subCategory = subCats[Math.floor(r2 * subCats.length)]
    const segment = SEGMENTS[Math.floor(r3 * SEGMENTS.length)]
    const healthStatus = HEALTH_STATUSES[Math.floor(r4 * HEALTH_STATUSES.length)]
    const productName = PRODUCT_NAMES[i % PRODUCT_NAMES.length]

    const lat = -5.9 - r * 2.9
    const lng = 105.1 + r2 * 8.8

    const productKey = 10000 + i
    const cost = Math.round(50 + r * 2000)
    const avgSellingPrice = Math.round(cost * (1.2 + r2 * 0.8))
    const totalOrders = Math.round(10 + r3 * 500)
    const totalRevenue = totalOrders * avgSellingPrice
    const healthScore = Math.round(30 + r4 * 70)

    features.push({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [lng, lat] as [number, number],
      },
      properties: {
        id: `mock-${productKey}`,
        product_key: productKey,
        product_name: `${productName} #${(i + 1).toString().padStart(4, '0')}`,
        category,
        color: CATEGORY_COLORS[category],
        category_color: CATEGORY_COLORS[category],
        segment,
        segment_color: segment === 'High-Performer' ? '#10b981' : segment === 'Mid-Range' ? '#f59e0b' : '#ef4444',
        cost,
        avg_selling_price: avgSellingPrice,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_quantity: Math.round(totalOrders * (1 + r)),
        health_score: healthScore,
        health_status: healthStatus,
        latitude: lat,
        longitude: lng,
        recency: 135,
        time_span: Math.round(30 + r4 * 120),
        sub_category: subCategory,
      },
    })
  }

  return { type: 'FeatureCollection', features }
}
