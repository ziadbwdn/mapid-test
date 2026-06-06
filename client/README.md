# Client — Product Analytics Frontend

Frontend aplikasi Product Analytics Dashboard. Dibangun dengan React 19, TypeScript, Vite 6, dan Tailwind CSS 4.

## Prerequisites

- Node.js 20+
- npm
- Server backend berjalan (lihat `server/README.md`)

## Instalasi

```bash
npm install
cp .env .env.local
```

Sesuaikan `VITE_API_URL` di `.env.local` dengan URL server backend (default: `http://localhost:3001/api`).

## Development

```bash
npm run dev
```

Akses di `http://localhost:3000`.

## Halaman

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/` | Home | Landing page |
| `/map` | WebGIS | Peta interaktif MapLibre GL JS |
| `/dashboard` | Dashboard | KPI, charts, product table |

## Fitur

- **WebGIS**: Peta interaktif dengan marker clustering, filter kategori/segmen, search produk
- **Dashboard**: KPI Cards, chart distribusi, histogram biaya, BCG Matrix quadrant, analisis profit, product table (pagination + search + sort)
- **Responsive**: Desktop dan mobile

## Struktur Folder

```
src/
├── components/
│   ├── layout/     # Navbar, Footer
│   └── ui/         # KPI Card, Button, ErrorBoundary
├── features/
│   ├── map/        # WebGIS components
│   └── dashboard/  # Dashboard components
├── hooks/          # Custom hooks
├── pages/          # Route pages
├── services/       # API client
├── types/          # TypeScript types
└── utils/          # Formatters, validators
```
