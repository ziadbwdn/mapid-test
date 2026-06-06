# Product Analytics Dashboard — MapID

Aplikasi **Product Analytics Dashboard** dengan WebGIS dan Dashboard Analitik. Dibangun menggunakan React (Vite + TypeScript) untuk frontend dan Node.js (Express) untuk backend dengan PostgreSQL + PostGIS.

## Struktur Proyek

```
root/
├── client/          # Frontend React
├── server/          # Backend Express API
├── docs/            # Dokumentasi
│   ├── adr/         # Architectural Decision Records
│   ├── srs/         # Software Requirements Specification
│   └── guide/       # Panduan teknis
└── notebook/        # Eksplorasi data Python
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ dengan PostGIS
- npm

## Quick Start

### 1. Server

```bash
cd server
cp .env .env.local   # Sesuaikan konfigurasi database
npm install
npm run migrate
npm run dev
```

### 2. Client

```bash
cd client
cp .env .env.local
npm install
npm run dev
```

Akses client di `http://localhost:3000` dan API di `http://localhost:3001/api`.

## Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, MapLibre GL JS, Recharts |
| Backend | Node.js, Express.js, node-postgres, node-pg-migrations |
| Database | PostgreSQL 14+, PostGIS 3+ |
| Dataset | GeoJSON API — Produk retail di Pulau Jawa (100 titik) |
