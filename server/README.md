# Server — Product Analytics API

REST API untuk Product Analytics Dashboard. Dibangun dengan Express.js dan PostgreSQL + PostGIS.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ dengan PostGIS

## Instalasi

```bash
npm install
cp .env .env.local
```

Sesuaikan `DATABASE_URL` di `.env.local` dengan koneksi database lokal Anda.

## Migrasi Database

```bash
npm run migrate
```

Menjalankan migrasi SQL menggunakan `node-pg-migrations`.

## Development

```bash
npm run dev
```

Server berjalan di `http://localhost:3001`.

## Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/map/geojson` | GeoJSON untuk MapLibre |
| GET | `/api/kpi` | Key Performance Indicators |
| GET | `/api/analytics/category` | Distribusi kategori |
| GET | `/api/analytics/segment` | Distribusi segmen |
| GET | `/api/analytics/cost-distribution` | Histogram biaya |
| GET | `/api/analytics/health` | Health report |
| GET | `/api/analytics/health-quadrant` | BCG Matrix |
| GET | `/api/analytics/profit-by-category` | Profit per kategori |
| GET | `/api/analytics/maintenance-hitlist` | Bottom 10 produk |
| GET | `/api/products` | Product table (pagination, search, sort) |
| POST | `/api/import` | Import data dari GeoJSON API |

## Struktur Folder

```
src/
├── config/          # Database & environment config
├── middleware/      # Express middleware
├── routes/         # Route definitions
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # SQL queries
├── migrations/     # SQL migration files
└── utils/          # Helpers
```
